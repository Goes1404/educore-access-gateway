import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  context?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signup-assistant`;

const AIAssistant = ({ context }: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    {
      label: "Calcular renda per capita",
      message: "Me ajude a calcular minha renda per capita familiar. Quais informações você precisa?",
      icon: Calculator,
    },
    {
      label: "Sobre isenção de taxas",
      message: "Quais são os critérios para conseguir isenção de taxas nos vestibulares?",
      icon: Bot,
    },
  ];

  const streamChat = async (userMessages: Message[]) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: userMessages, context }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao conectar com o assistente");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const updateAssistant = (content: string) => {
        assistantContent = content;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: "assistant", content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              updateAssistant(assistantContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao conectar com o assistente");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Desculpe, ocorreu um erro. Por favor, tente novamente." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    await streamChat(newMessages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    return content
      .split("\n")
      .map((line, i) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        // Italic
        line = line.replace(/\*(.*?)\*/g, "<em>$1</em>");
        // List items
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return `<li key="${i}" class="ml-4">${line.slice(2)}</li>`;
        }
        return line ? `<p key="${i}">${line}</p>` : "<br/>";
      })
      .join("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
          isOpen ? "scale-0" : "scale-100"
        }`}
        aria-label="Abrir assistente"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-10 right-0 bg-foreground text-background text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Precisa de ajuda?
        </span>
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-card border border-border rounded-2xl shadow-2xl transition-all duration-300 flex flex-col ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
        style={{ maxHeight: "min(600px, calc(100vh - 120px))" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Assistente EduCore</h3>
              <p className="text-xs text-muted-foreground">Tire suas dúvidas sobre o cadastro</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Bot className="w-12 h-12 text-primary/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Olá! Sou o assistente do EduCore. Posso ajudar você com:
                </p>
              </div>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(action.message)}
                    className="w-full p-3 text-left rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-3"
                  >
                    <action.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-primary" : "bg-primary/10"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  <div
                    className="text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                </div>
              </div>
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua dúvida..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="rounded-xl w-10 h-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
