import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, Play, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Mock data for continue studying carousel
  const continueStudying = [
    {
      id: "1",
      title: "Trigonometria Básica",
      subject: "Matemática",
      progress: 65,
      lastLesson: "Razões Trigonométricas",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
    },
    {
      id: "2",
      title: "Revolução Industrial",
      subject: "História",
      progress: 40,
      lastLesson: "Primeira Fase",
      image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=400&h=200&fit=crop",
    },
    {
      id: "3",
      title: "Redação ENEM",
      subject: "Português",
      progress: 80,
      lastLesson: "Estrutura Dissertativa",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=200&fit=crop",
    },
  ];

  // Mock data for learning trails
  const learningTrails = [
    {
      id: "1",
      subject: "Matemática",
      trails: [
        { id: "m1", title: "Álgebra Básica", lessons: 12, duration: "8h" },
        { id: "m2", title: "Geometria Plana", lessons: 10, duration: "6h" },
        { id: "m3", title: "Trigonometria", lessons: 8, duration: "5h" },
      ],
      color: "bg-blue-500",
      emoji: "📐",
    },
    {
      id: "2",
      subject: "Português",
      trails: [
        { id: "p1", title: "Gramática Essencial", lessons: 15, duration: "10h" },
        { id: "p2", title: "Interpretação de Texto", lessons: 8, duration: "4h" },
        { id: "p3", title: "Redação ENEM", lessons: 12, duration: "8h" },
      ],
      color: "bg-green-500",
      emoji: "📚",
    },
    {
      id: "3",
      subject: "História",
      trails: [
        { id: "h1", title: "Brasil Colônia", lessons: 10, duration: "7h" },
        { id: "h2", title: "Era Vargas", lessons: 8, duration: "5h" },
        { id: "h3", title: "Ditadura Militar", lessons: 6, duration: "4h" },
      ],
      color: "bg-amber-500",
      emoji: "🏛️",
    },
    {
      id: "4",
      subject: "Física",
      trails: [
        { id: "f1", title: "Cinemática", lessons: 10, duration: "6h" },
        { id: "f2", title: "Dinâmica", lessons: 12, duration: "8h" },
        { id: "f3", title: "Termodinâmica", lessons: 8, duration: "5h" },
      ],
      color: "bg-purple-500",
      emoji: "⚡",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Estudante";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">EduCore</h1>
              <div className="w-8 h-1 bg-accent rounded-full hidden sm:block" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{profile?.full_name || user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile?.profile_type === "etec" ? "Aluno ETEC" : 
                   profile?.profile_type === "vestibular" ? "Aluno Vestibular" : 
                   profile?.profile_type || "Estudante"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {getGreeting()}, {firstName}! 👋
          </h2>
          <p className="text-muted-foreground text-lg">
            Continue sua jornada de aprendizado
          </p>
        </section>

        {/* Continue Studying Carousel */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Continue Estudando
            </h3>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver tudo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueStudying.map((trail) => (
              <div
                key={trail.id}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={trail.image}
                    alt={trail.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-xs font-medium text-white/80 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                      {trail.subject}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {trail.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {trail.lastLesson}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${trail.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {trail.progress}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Trails by Subject */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Trilhas de Aprendizado
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningTrails.map((subject) => (
              <div
                key={subject.id}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{subject.emoji}</span>
                  <h4 className="text-lg font-semibold text-foreground">{subject.subject}</h4>
                </div>

                <div className="space-y-3">
                  {subject.trails.map((trail) => (
                    <div
                      key={trail.id}
                      className="group flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div>
                        <h5 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {trail.title}
                        </h5>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {trail.lessons} aulas
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {trail.duration}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
