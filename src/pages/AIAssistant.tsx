import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatLimits {
  questions_count: number;
  last_reset_at: string;
}

const AIAssistant = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLimits, setChatLimits] = useState<AIChatLimits | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const QUESTION_LIMIT = 3;
  const RESET_INTERVAL = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChatLimits = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('ai_chat_limits')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching chat limits:', error);
          return;
        }

        if (data) {
          setChatLimits(data);
          
          // Check if reset is needed
          const lastReset = new Date(data.last_reset_at);
          const now = new Date();
          const timeSinceReset = now.getTime() - lastReset.getTime();
          
          if (timeSinceReset >= RESET_INTERVAL) {
            // Reset the counter
            const { error: updateError } = await supabase
              .from('ai_chat_limits')
              .update({
                questions_count: 0,
                last_reset_at: now.toISOString()
              })
              .eq('user_id', user.id);

            if (!updateError) {
              setChatLimits({
                questions_count: 0,
                last_reset_at: now.toISOString()
              });
            }
          } else {
            // Calculate time left until reset
            setTimeLeft(RESET_INTERVAL - timeSinceReset);
          }
        } else {
          // Create new chat limits entry
          const now = new Date();
          const { data: newLimits, error: insertError } = await supabase
            .from('ai_chat_limits')
            .insert({
              user_id: user.id,
              questions_count: 0,
              last_reset_at: now.toISOString()
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating chat limits:', insertError);
          } else {
            setChatLimits(newLimits);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchChatLimits();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1000) {
            // Time's up, reset the limits
            if (user) {
              supabase
                .from('ai_chat_limits')
                .update({
                  questions_count: 0,
                  last_reset_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
                .then(() => {
                  setChatLimits(prev => prev ? {
                    ...prev,
                    questions_count: 0,
                    last_reset_at: new Date().toISOString()
                  } : null);
                });
            }
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timeLeft, user]);

  const formatTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const canSendMessage = () => {
    return chatLimits && chatLimits.questions_count < QUESTION_LIMIT;
  };

  const sendToGemini = async (message: string) => {
    const API_KEYS = [
      'AIzaSyB_E_5nK7SKDTLPF0aaqltL9XcufYUeDfs',
      'AIzaSyC4WA77aq9bclZz2JJmnFLtwIusO2K6zLk',
      'AIzaSyBOs_VNazL5k_y68HvUxbGv6ojg1Xp7RVs',
      'AIzaSyCp0yUfC7oM0igNP56TZjGrTgpdQCkq0lA',
      'AIzaSyALV8r7Z51MRIywjoraQ1-Kgrc3yWCs3wg'
    ];

    const randomKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
    
    const systemPrompt = `أنت مساعد ذكي في تطبيق ChitChat للمراسلة. تطبيق ChitChat هو تطبيق مراسلة شبيه بالواتساب حيث:

- يمكن للمستخدمين التسجيل بالبريد الإلكتروني فقط (يجب أن ينتهي بـ @gmail.com)
- كل مستخدم يحصل على رقم مميز مكون من 9 أرقام يبدأ بـ "73"
- يمكن مشاركة الرقم المميز مع الأصدقاء للتواصل
- في صفحة الدردشات: يوجد قائمة بالمحادثات، زر عائم لبدء محادثة جديدة
- في الإعدادات: يمكن تغيير صورة البروفايل، المظهر (فاتح/داكن/النظام)، عرض الرقم المميز
- يمكن تسمية المحادثات بأسماء مخصصة
- كل مستخدم له 3 أسئلة فقط كل 5 ساعات مع المساعد الذكي

أجب بشكل مفيد ومختصر باللغة العربية عن أي أسئلة حول التطبيق أو أي موضوع عام.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${randomKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: message }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1000,
          }
        }),
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !canSendMessage()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      // Update question count
      const newCount = (chatLimits?.questions_count || 0) + 1;
      const { error: updateError } = await supabase
        .from('ai_chat_limits')
        .update({ questions_count: newCount })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating chat limits:', updateError);
      } else {
        setChatLimits(prev => prev ? { ...prev, questions_count: newCount } : null);
      }

      // Send to Gemini
      const response = await sendToGemini(userMessage.content);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال الرسالة',
        variant: 'destructive',
      });

      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => navigate('/chats')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="font-medium">مساعد الذكاء الاصطناعي</h1>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xl text-muted-foreground">اسأل الذكاء الاصطناعي</p>
              <p className="text-sm text-muted-foreground mt-2">
                يمكنك طرح {QUESTION_LIMIT - (chatLimits?.questions_count || 0)} أسئلة أخرى
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-end mt-1">
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        {!canSendMessage() && timeLeft > 0 ? (
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              لقد استنفدت أسئلتك لهذه الفترة
            </p>
            <p className="text-lg font-mono">
              {formatTimeLeft(timeLeft)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              الوقت المتبقي للإعادة التعيين
            </p>
          </div>
        ) : (
          <div className="flex items-end space-x-2 space-x-reverse">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب سؤالك..."
                className="resize-none min-h-[40px] max-h-32"
                rows={1}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {QUESTION_LIMIT - (chatLimits?.questions_count || 0)} أسئلة متبقية
              </p>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading}
              size="sm"
              className={`h-10 w-10 rounded-full ${
                newMessage.trim() && !loading
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;