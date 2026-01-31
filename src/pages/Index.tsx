import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import AIAssistant from "@/components/auth/AIAssistant";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <TooltipProvider>
      <AuthLayout>
        {isLogin ? (
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </AuthLayout>
      <AIAssistant context={isLogin ? "Tela de login" : "Tela de cadastro"} />
    </TooltipProvider>
  );
};

export default Index;
