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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

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

      // 1. Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }

      // 2. Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        profile_type: data.profileType,
        current_school: data.currentSchool || null,
        desired_course: data.desiredCourse || null,
        family_income: data.familyIncome || null,
        technical_course: data.technicalCourse || null,
        subject: data.subject || null,
        teaching_targets: data.teachingTargets || null,
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw profileError;
      }

      // 3. Assign role based on profile type
      const roleMap: Record<string, "admin" | "moderator" | "student" | "teacher"> = {
        etec: "student",
        vestibular: "student",
        professor: "teacher",
      };

      const role = roleMap[data.profileType] || "student";
      
      const { error: roleError } = await supabase.from("user_roles").insert([{
        user_id: authData.user.id,
        role: role,
      }]);

      if (roleError) {
        console.error("Error assigning role:", roleError);
        // Don't throw here - profile was created, role is secondary
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

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
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
