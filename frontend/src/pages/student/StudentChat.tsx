import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, MessageCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { studentAPI } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function StudentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>('');
  const [threads, setThreads] = useState<{thread_id: string, created: string, firstUserMsg?: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get thread ID from URL params or create new one
    const params = new URLSearchParams(location.search);
    const existingThreadId = params.get('thread');
    
    if (existingThreadId) {
      setThreadId(existingThreadId);
    } else {
      // Create thread from backend
      studentAPI.createThread().then(res => {
        const newThreadId = res.data.thread_id;
        setThreadId(newThreadId);
        navigate(`/student/chat?thread=${newThreadId}`, { replace: true });
      });
    }
    // Welcome message
    setMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your University Portal assistant. How can I help you today?',
      timestamp: new Date(),
    }]);
    // Fetch all threads for sidebar
    fetchThreads();
  }, [location.search, navigate]);

  // Fetch all threads for sidebar
  const fetchThreads = async () => {
    // Fetch all system messages (thread creation) from backend
    try {
      const res = await studentAPI.getThreads();
      setThreads(res.data.threads || []);
    } catch (e) {
      setThreads([]);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading || !threadId) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await studentAPI.sendMessage(threadId, inputMessage);
      // Expecting backend to return { response: string, history?: Message[] }
      const assistantMsg: Message = {
        role: 'assistant',
        content: response.data.response || 'No response from assistant.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again. Check if the backend is running.",
        variant: "destructive",
      });
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSimulatedResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('course') || lowerInput.includes('class')) {
      return 'I can help you find information about courses and class schedules. You can check your enrolled courses in the student portal or browse the course catalog for new enrollments.';
    } else if (lowerInput.includes('grade') || lowerInput.includes('score')) {
      return 'Your grades are available in the student portal under the "Academics" section. If you have questions about a specific grade, you can contact your instructor directly.';
    } else if (lowerInput.includes('schedule') || lowerInput.includes('timetable')) {
      return 'Your class schedule is available in the student portal. You can also download it as a PDF or sync it with your calendar app.';
    } else if (lowerInput.includes('library') || lowerInput.includes('book')) {
      return 'The university library offers both physical and digital resources. You can search the catalog online and reserve books. Digital resources are available 24/7 through the portal.';
    } else if (lowerInput.includes('help') || lowerInput.includes('support')) {
      return 'I\'m here to help! I can assist with information about courses, grades, schedules, library resources, campus events, and general university policies. What specific information do you need?';
    } else {
      return `I understand you're asking about "${input}". I'm here to help with university-related questions. Could you provide more details about what specific information you need?`;
    }
  };

  const handleNewThread = async () => {
    try {
      const res = await studentAPI.createThread();
      const newThreadId = res.data.thread_id;
      setMessages([{
        role: 'assistant',
        content: 'Hello! I\'m your University Portal assistant. How can I help you today?',
        timestamp: new Date(),
      }]);
      navigate(`/student/chat?thread=${newThreadId}`);
      fetchThreads();
    } catch (e) {
      toast({ title: 'Error', description: 'Could not create new chat thread', variant: 'destructive' });
    }
  };

  return (
  <div className="min-h-screen bg-background flex flex-row">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-primary/20 flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">Chats</h2>
          <Button
            onClick={handleNewThread}
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/10"
          >
            New Chat
          </Button>
        </div>
  <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
          {threads.map((t, idx) => (
            <div
              key={t.thread_id}
              className={`rounded-lg p-3 flex items-center group cursor-pointer border transition-all shadow-sm ${t.thread_id === threadId ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'border-transparent hover:bg-primary/5 hover:border-primary/40'}`}
              style={{ minHeight: 56, justifyContent: 'center' }}
            >
              <div
                className="flex-1 min-w-0"
                onClick={() => navigate(`/student/chat?thread=${t.thread_id}`)}
              >
                <div className="font-semibold text-foreground truncate" style={{ fontSize: 15 }}>
                  {t.firstUserMsg ? t.firstUserMsg.slice(0, 40) : <span className="italic text-muted-foreground">No user message</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-1" style={{ fontFamily: 'monospace' }}>
                  {new Date(t.created).toLocaleString()}
                </div>
              </div>
              <button
                className="ml-2 p-1 rounded hover:bg-destructive/20 text-destructive opacity-70 hover:opacity-100 transition-opacity"
                title="Delete thread"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this chat and all its messages?')) {
                    try {
                      await studentAPI.deleteThread(t.thread_id);
                      fetchThreads();
                      // If deleted thread is active, clear chat and redirect
                      if (t.thread_id === threadId) {
                        setMessages([]);
                        setThreadId('');
                        navigate('/student/chat');
                      }
                    } catch {
                      toast({ title: 'Error', description: 'Could not delete thread', variant: 'destructive' });
                    }
                  }
                }}
                tabIndex={-1}
                type="button"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </aside>
      {/* Main Chat Area */}
  <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-background border-b border-primary/20 px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-4 text-primary hover:bg-primary/10"
              onClick={() => navigate('/login')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center">
              <MessageCircle className="h-6 w-6 text-primary mr-2 glow-secondary" />
              <h1 className="text-xl font-bold text-primary glow-primary">
                University Assistant
              </h1>
            </div>
          </div>
        </header>
        {/* Chat Messages */}
  <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full px-4">
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} chat-message`}
            >
              <Card className={`max-w-xs md:max-w-md lg:max-w-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground glow-secondary'
                  : 'gradient-card neon-border'
              }`}>
                <p className={`text-sm ${
                  message.role === 'user' ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                  {message.content}
                </p>
                <p className={`text-xs mt-2 opacity-70 ${
                  message.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-xs md:max-w-md lg:max-w-lg p-4 gradient-card neon-border">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Assistant is typing...</span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-primary/20 py-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about university services..."
              className="flex-1 neon-border bg-input text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground glow-secondary hover:glow-primary transition-glow"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
}