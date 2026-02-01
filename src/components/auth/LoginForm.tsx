import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm = ({ onSwitchToSignup }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await signIn(email, password);
    
    setIsSubmitting(false);
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">EduCore</h1>
        <div className="w-12 h-1 bg-accent mx-auto rounded-full mt-2" />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta!</h2>
        <p className="text-muted-foreground mt-2">
          Entre na sua conta para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="educore-label">
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="educore-input pl-12"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="educore-label">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="educore-input pl-12 pr-12"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label 
              htmlFor="remember" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Lembrar de mim
            </label>
          </div>
          <a 
            href="#" 
            className="text-sm text-primary hover:text-navy-light transition-colors font-medium"
          >
            Esqueceu a senha?
          </a>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full py-6 text-base font-semibold shadow-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground">
          Não tem uma conta?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-primary hover:text-navy-light font-semibold transition-colors"
          >
            Criar Conta
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
