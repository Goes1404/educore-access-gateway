import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  profile_type: string;
  current_school: string | null;
  desired_course: string | null;
  family_income: string | null;
  technical_course: string | null;
  subject: string | null;
  teaching_targets: string[] | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  profileType: string;
  currentSchool?: string;
  desiredCourse?: string;
  familyIncome?: string;
  technicalCourse?: string;
  subject?: string;
  teachingTargets?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // If there's an error with the stored session, clear it
      if (error) {
        console.error("Session error, clearing stored session:", error);
        supabase.auth.signOut();
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }
      
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpData): Promise<{ error: Error | null }> => {
    try {
      setLoading(true);

      // Create auth user - profile and role are created automatically via database triggers
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: data.fullName,
            phone: data.phone,
            profile_type: data.profileType,
            current_school: data.currentSchool || null,
            desired_course: data.desiredCourse || null,
            family_income: data.familyIncome || null,
            technical_course: data.technicalCourse || null,
            subject: data.subject || null,
            teaching_targets: data.teachingTargets || null,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }

      // Update profile with additional fields that weren't captured by the trigger
      if (data.currentSchool || data.desiredCourse || data.familyIncome || 
          data.technicalCourse || data.subject || data.teachingTargets) {
        // Small delay to ensure trigger has completed
        setTimeout(async () => {
          await supabase.from("profiles").update({
            current_school: data.currentSchool || null,
            desired_course: data.desiredCourse || null,
            family_income: data.familyIncome || null,
            technical_course: data.technicalCourse || null,
            subject: data.subject || null,
            teaching_targets: data.teachingTargets || null,
          }).eq("user_id", authData.user!.id);
        }, 500);
      }

      toast({
        title: "Conta criada com sucesso! 🎉",
        description: "Verifique seu e-mail para confirmar sua conta.",
      });

      return { error: null };
    } catch (error: any) {
      console.error("SignUp error:", error);
      
      let message = "Erro ao criar conta. Tente novamente.";
      if (error.message?.includes("already registered")) {
        message = "Este e-mail já está cadastrado.";
      }
      
      toast({
        title: "Erro no cadastro",
        description: message,
        variant: "destructive",
      });

      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      setLoading(true);
      
      // Clear any corrupted session before attempting login
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession.session === null) {
        // Clear localStorage to remove any stale tokens
        const storageKey = `sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
        localStorage.removeItem(storageKey);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      toast({
        title: "Bem-vindo de volta! 👋",
        description: "Login realizado com sucesso.",
      });

      return { error: null };
    } catch (error: any) {
      console.error("SignIn error:", error);
      
      let message = "Erro ao fazer login. Tente novamente.";
      if (error.message?.includes("Invalid login credentials")) {
        message = "E-mail ou senha incorretos.";
      } else if (error.message?.includes("Email not confirmed")) {
        message = "Confirme seu e-mail antes de fazer login.";
      } else if (error.message?.includes("refresh_token_not_found")) {
        message = "Sessão expirada. Por favor, faça login novamente.";
      }

      toast({
        title: "Erro no login",
        description: message,
        variant: "destructive",
      });

      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      toast({
        title: "Até logo! 👋",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error("SignOut error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
