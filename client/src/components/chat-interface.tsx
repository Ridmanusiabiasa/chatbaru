import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Bot, User, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@shared/schema";

const AVAILABLE_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini", description: "Fast and efficient" },
  { value: "gpt-4o", label: "GPT-4o", description: "Most capable" },
  { value: "gpt-4.1", label: "GPT-4.1", description: "Enhanced reasoning" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano", description: "Ultra fast" },
];

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          return !inline && language ? (
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              className="rounded-md my-2"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        pre({ children }) {
          return <div className="my-2">{children}</div>;
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-2">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold mb-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-bold mb-2">{children}</h3>;
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
        },
        blockquote({ children }) {
          return <blockquote className="border-l-4 border-border pl-4 my-2 text-muted-foreground">{children}</blockquote>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [sessionTokens, setSessionTokens] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; model: string }) => {
      const response = await apiRequest("POST", "/api/chat/send", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSessionTokens(prev => prev + (data.tokensUsed || 0));
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      
      if (data.error) {
        toast({
          title: "API Connection Issue",
          description: "Using fallback response. Please check your API key configuration.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate({ message, model: selectedModel });
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-64 bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.label}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Tokens:</span>
              <span className="ml-1 text-foreground">{sessionTokens}</span>
            </div>
            <Button variant="ghost" size="sm">
              <Settings size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Bot className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Welcome to RidChat AI
                </h3>
                <p className="text-muted-foreground">
                  Start a conversation with your AI assistant. Choose a model and ask me anything!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`group w-full border-b border-border message-hover ${
                  msg.role === "user" ? "user-message" : "assistant-message"
                }`}
              >
                <div className="flex gap-4 p-6 max-w-4xl mx-auto">
                  <div className="flex-shrink-0">
                    {msg.role === "user" ? (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="text-primary-foreground" size={16} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <Bot className="text-white" size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground">
                      {msg.role === "assistant" ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground space-x-2">
                      <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      {msg.tokens > 0 && (
                        <>
                          <span>•</span>
                          <span>{msg.tokens} tokens</span>
                        </>
                      )}
                      {msg.model && (
                        <>
                          <span>•</span>
                          <span>{msg.model}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {sendMessageMutation.isPending && (
            <div className="group w-full border-b border-border assistant-message">
              <div className="flex gap-4 p-6 max-w-4xl mx-auto">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Bot className="text-white animate-pulse" size={16} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="border-t border-border bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message RidChat AI..."
              className="resize-none bg-muted border-border text-foreground placeholder:text-muted-foreground pr-16 py-4 min-h-[60px] max-h-[200px] rounded-xl"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
              size="sm"
              className="absolute bottom-2 right-2 rounded-lg h-8 w-8 p-0"
            >
              <Send size={16} />
            </Button>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">
              RidChat AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
