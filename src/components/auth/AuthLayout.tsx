import authHeroImage from "@/assets/auth-hero.jpg";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${authHeroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/90 to-primary/80" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <div className="max-w-md text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary-foreground mb-2">
                EduCore
              </h1>
              <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
            </div>
            
            <h2 className="text-3xl font-semibold text-primary-foreground leading-tight mb-6">
              A excelência acadêmica ao seu alcance
            </h2>
            
            <p className="text-primary-foreground/80 text-lg">
              Sua plataforma completa para preparação ETEC e Vestibular
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
