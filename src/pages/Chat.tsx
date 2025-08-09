import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  MoreVertical, 
  Send,
  Smile,
  Image,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  content: string | null;
  message_type: string;
  image_url: string | null;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  participant1_name: string | null;
  participant2_name: string | null;
  other_user: {
    unique_number: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!user || !id) return;

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            other_user:profiles!conversations_participant2_id_fkey(
              unique_number,
              display_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching conversation:', error);
          return;
        }

        setConversation(data);
        const currentName = user.id === data.participant1_id 
          ? data.participant1_name 
          : data.participant2_name;
        setNewChatName(currentName || '');
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchMessages = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
    fetchMessages();
  }, [user, id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: id,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في إرسال الرسالة',
          variant: 'destructive',
        });
        return;
      }

      // Update conversation last message
      await supabase
        .from('conversations')
        .update({
          last_message: newMessage.trim(),
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      setNewMessage('');
      
      // Refresh messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveName = async () => {
    if (!conversation || !user) return;

    try {
      const updateField = user.id === conversation.participant1_id 
        ? 'participant1_name' 
        : 'participant2_name';

      const { error } = await supabase
        .from('conversations')
        .update({ [updateField]: newChatName || null })
        .eq('id', conversation.id);

      if (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في حفظ الاسم',
          variant: 'destructive',
        });
        return;
      }

      setConversation(prev => prev ? { ...prev, [updateField]: newChatName || null } : null);

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ اسم الدردشة بنجاح',
      });

      setShowNameDialog(false);
    } catch (error) {
      console.error('Error saving name:', error);
    }
  };

  const getChatDisplayName = () => {
    if (!conversation || !user) return 'مستخدم';
    
    const chatName = user.id === conversation.participant1_id 
      ? conversation.participant1_name 
      : conversation.participant2_name;
    
    return chatName || conversation.other_user?.display_name || conversation.other_user?.unique_number || 'مستخدم';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

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
            <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate('/chats')}>
              <AvatarImage src={conversation?.other_user?.avatar_url || ''} />
              <AvatarFallback className="text-xs">
                {getChatDisplayName().charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="font-medium">{getChatDisplayName()}</h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowNameDialog(true)}>
                تسمية الدردشة
              </DropdownMenuItem>
              <DropdownMenuItem>
                حظر
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                الابلاغ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-muted-foreground">قل مرحبا</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-end mt-1 space-x-1 space-x-reverse">
                  <span className="text-xs opacity-70">
                    {formatTime(message.created_at)}
                  </span>
                  {message.sender_id === user?.id && (
                    message.is_read ? (
                      <Eye className="h-3 w-3 text-primary opacity-70" />
                    ) : (
                      <EyeOff className="h-3 w-3 opacity-70" />
                    )
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-end space-x-2 space-x-reverse">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Smile className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالة..."
              className="resize-none pr-10 min-h-[40px] max-h-32"
              rows={1}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute left-2 bottom-2 h-6 w-6 p-0"
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className={`h-10 w-10 rounded-full ${
              newMessage.trim() 
                ? 'bg-primary hover:bg-primary/90' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">
              ضع اسماً لهذه الدردشة
            </h3>
            <div className="space-y-2">
              <Label htmlFor="chat-name">اسم الدردشة</Label>
              <Input
                id="chat-name"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                placeholder="أدخل اسماً للدردشة"
              />
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <Button onClick={handleSaveName} className="flex-1">
                حفظ
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowNameDialog(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;