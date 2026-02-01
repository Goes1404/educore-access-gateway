import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, ArrowRight, GraduationCap, Rocket, UserCog, Info, Upload, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

type ProfileType = "etec" | "vestibular" | "professor" | null;
type TeachingTarget = "etec" | "vestibular";

const SignupForm = ({ onSwitchToLogin }: SignupFormProps) => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();

  // Step 1 - Basic Data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 - Profile Selection
  const [profileType, setProfileType] = useState<ProfileType>(null);

  // Step 3 - Conditional Fields
  const [currentSchool, setCurrentSchool] = useState("");
  const [desiredCourse, setDesiredCourse] = useState("");
  const [familyIncome, setFamilyIncome] = useState("");
  const [technicalCourse, setTechnicalCourse] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [subject, setSubject] = useState("");
  const [teachingTargets, setTeachingTargets] = useState<TeachingTarget[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTeachingTarget = (target: TeachingTarget) => {
    setTeachingTargets(prev => 
      prev.includes(target) 
        ? prev.filter(t => t !== target)
        : [...prev, target]
    );
  };

  const validateStep1 = () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return false;
    }
    if (password !== confirmPassword) {
      return false;
    }
    if (password.length < 8) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2 && profileType) {
      setStep(3);
    } else if (step === 3 && acceptedTerms && profileType) {
      setIsSubmitting(true);
      
      const { error } = await signUp({
        email,
        password,
        fullName,
        phone,
        profileType,
        currentSchool: currentSchool || undefined,
        desiredCourse: desiredCourse || undefined,
        familyIncome: familyIncome || undefined,
        technicalCourse: technicalCourse || undefined,
        subject: subject || undefined,
        teachingTargets: teachingTargets.length > 0 ? teachingTargets : undefined,
      });

      if (!error) {
        // Switch to login after successful signup
        onSwitchToLogin();
      }
      
      setIsSubmitting(false);
    }
  };

  const profileOptions = [
    {
      id: "etec" as const,
      icon: GraduationCap,
      emoji: "🎓",
      title: "Aluno ETEC",
      description: "Preparação para o vestibulinho"
    },
    {
      id: "vestibular" as const,
      icon: Rocket,
      emoji: "🚀",
      title: "Aluno Vestibular",
      description: "Foco em universidades e ENEM"
    },
    {
      id: "professor" as const,
      icon: UserCog,
      emoji: "👨‍🏫",
      title: "Professor",
      description: "Acesso à área de docentes"
    }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            s === step
              ? "bg-primary text-primary-foreground scale-110"
              : s < step
              ? "bg-success text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {s < step ? <Check className="w-5 h-5" /> : s}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Criar sua conta</h2>
        <p className="text-muted-foreground mt-1">Preencha seus dados básicos</p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="educore-label">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              className="educore-input pl-12"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signupEmail" className="educore-label">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="signupEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="educore-input pl-12"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="educore-label">Celular/WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className="educore-input pl-12"
              maxLength={16}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signupPassword" className="educore-label">Senha</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="signupPassword"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="educore-input pl-12 pr-12"
              required
              minLength={8}
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

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="educore-label">Confirmar Senha</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              className={`educore-input pl-12 pr-12 ${
                confirmPassword && password !== confirmPassword ? "border-destructive" : ""
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-destructive mt-1">As senhas não coincidem</p>
          )}
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Qual é o seu perfil?</h2>
        <p className="text-muted-foreground mt-1">Escolha como você vai usar o EduCore</p>
      </div>

      <div className="space-y-4">
        {profileOptions.map((profile) => (
          <button
            key={profile.id}
            type="button"
            onClick={() => setProfileType(profile.id)}
            className={`educore-card-select w-full text-left flex items-center gap-4 ${
              profileType === profile.id ? "selected" : ""
            }`}
          >
            <div className="profile-icon">
              <span className="text-2xl">{profile.emoji}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{profile.title}</h3>
              <p className="text-sm text-muted-foreground">{profile.description}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              profileType === profile.id 
                ? "border-primary bg-primary" 
                : "border-border"
            }`}>
              {profileType === profile.id && (
                <Check className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
          </button>
        ))}
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Quase lá!</h2>
        <p className="text-muted-foreground mt-1">Complete seu perfil de {
          profileType === "etec" ? "Aluno ETEC" :
          profileType === "vestibular" ? "Aluno Vestibular" : "Professor"
        }</p>
      </div>

      <div className="space-y-4">
        {/* Vestibular Student Fields */}
        {profileType === "vestibular" && (
          <>
            <div>
              <label htmlFor="currentSchool" className="educore-label">Escola Atual</label>
              <input
                id="currentSchool"
                type="text"
                value={currentSchool}
                onChange={(e) => setCurrentSchool(e.target.value)}
                placeholder="Nome da sua escola"
                className="educore-input"
                required
              />
            </div>
            <div>
              <label htmlFor="desiredCourse" className="educore-label">
                Curso Desejado <span className="text-muted-foreground font-normal">(Opcional)</span>
              </label>
              <input
                id="desiredCourse"
                type="text"
                value={desiredCourse}
                onChange={(e) => setDesiredCourse(e.target.value)}
                placeholder="Ex: Medicina, Engenharia..."
                className="educore-input"
              />
            </div>
            <div>
              <label htmlFor="familyIncome" className="educore-label flex items-center gap-2">
                Renda Familiar Mensal
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Usado para calcular automaticamente sua isenção de taxas em vestibulares</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <select
                id="familyIncome"
                value={familyIncome}
                onChange={(e) => setFamilyIncome(e.target.value)}
                className="educore-input"
                required
              >
                <option value="">Selecione uma faixa</option>
                <option value="ate-1">Até 1 salário mínimo</option>
                <option value="1-2">1 a 2 salários mínimos</option>
                <option value="2-3">2 a 3 salários mínimos</option>
                <option value="3-5">3 a 5 salários mínimos</option>
                <option value="5+">Acima de 5 salários mínimos</option>
              </select>
            </div>
          </>
        )}

        {/* ETEC Student Fields */}
        {profileType === "etec" && (
          <>
            <div>
              <label htmlFor="etecSchool" className="educore-label">Escola Atual</label>
              <input
                id="etecSchool"
                type="text"
                value={currentSchool}
                onChange={(e) => setCurrentSchool(e.target.value)}
                placeholder="Nome da sua escola"
                className="educore-input"
                required
              />
            </div>
            <div>
              <label htmlFor="technicalCourse" className="educore-label">Curso Técnico Desejado</label>
              <input
                id="technicalCourse"
                type="text"
                value={technicalCourse}
                onChange={(e) => setTechnicalCourse(e.target.value)}
                placeholder="Ex: Informática, Administração..."
                className="educore-input"
                required
              />
            </div>
          </>
        )}

        {/* Professor Fields */}
        {profileType === "professor" && (
          <>
            <div>
              <label htmlFor="inviteCode" className="educore-label">
                Código de Convite <span className="text-destructive">*</span>
              </label>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Digite o código recebido"
                className="educore-input"
                required
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="educore-label">Foto de Perfil</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden ${
                    photoPreview ? "border-primary" : ""
                  }`}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Clique para fazer upload
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="educore-label">Disciplina</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Matemática, Física..."
                className="educore-input"
                required
              />
            </div>

            <div>
              <label className="educore-label">Leciono para:</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={teachingTargets.includes("etec")}
                    onCheckedChange={() => toggleTeachingTarget("etec")}
                  />
                  <span className="text-sm">ETEC</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={teachingTargets.includes("vestibular")}
                    onCheckedChange={() => toggleTeachingTarget("vestibular")}
                  />
                  <span className="text-sm">Vestibular</span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Terms Checkbox */}
        <div className="pt-4 border-t border-border">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="mt-0.5"
            />
            <span className="text-sm text-muted-foreground">
              Li e concordo com os{" "}
              <a href="#" className="text-primary hover:underline font-medium">
                Termos de Uso
              </a>{" "}
              e{" "}
              <a href="#" className="text-primary hover:underline font-medium">
                Política de Privacidade
              </a>
            </span>
          </label>
        </div>
      </div>
    </>
  );

  return (
    <div className="animate-in fade-in duration-300">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-6">
        <h1 className="text-3xl font-bold text-primary">EduCore</h1>
        <div className="w-12 h-1 bg-accent mx-auto rounded-full mt-2" />
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-6"
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <Button
            type="submit"
            disabled={
              (step === 1 && !validateStep1()) ||
              (step === 2 && !profileType) ||
              (step === 3 && !acceptedTerms) ||
              isSubmitting
            }
            className="flex-1 py-6 text-base font-semibold shadow-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Criando conta...
              </>
            ) : step === 3 ? (
              "Criar Conta"
            ) : (
              <>
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Login Link */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground">
          Já tem uma conta?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-primary hover:text-navy-light font-semibold transition-colors"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
