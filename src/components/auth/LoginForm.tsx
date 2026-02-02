import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm = ({ onSwitchToSignup }: LoginFormProps) => {
  // Estados para capturar os campos de uso diário [cite: 8, 9]
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // TRATAMENTO TÉCNICO: Limpeza para evitar erros de login 
      // Remove espaços extras e padroniza para minúsculas
      const cleanEmail = email.trim().toLowerCase();

      // Chama a função de autenticação do nosso Hook proprietário
      await signIn(cleanEmail, password);
      
    } catch (error: any) {
      // Captura falhas como "Invalid login credentials"
      setErrorMessage("E-mail ou senha incorretos. Verifique seus dados.");
      console.error("Erro de Autenticação:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Logo visível em dispositivos móveis (Mobile First) [cite: 103] */}
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

      {/* Exibição de Erro Amigável */}
      {errorMessage && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 text-center">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo de E-mail [cite: 9] */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
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
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary transition-all"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Campo de Senha com Ícone de Olho [cite: 9] */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
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
              className="w-full pl-12 pr-12 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary transition-all"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Recursos: Lembrar e Recuperação  */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
              Lembrar de mim
            </label>
          </div>
          <a href="#" className="text-sm text-primary font-medium hover:underline">
            Esqueceu a senha?
          </a>
        </div>

        <Button 
          type="submit" 
          className="w-full py-6 text-base font-semibold"
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

      {/* Link para Cadastro Social [cite: 11] */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground">
          Não tem uma conta?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-primary font-semibold hover:underline"
          >
            Criar Conta
          </button>
        </p>
      </div>

      {/* Indicador de Acessibilidade (Placeholder para o Script do VLibras)  */}
      <div className="fixed bottom-4 right-4">
        <span className="text-xs text-muted-foreground bg-secondary p-1 rounded">Acessibilidade VLibras</span>
      </div>
    </div>
  );
};

export default LoginForm;
