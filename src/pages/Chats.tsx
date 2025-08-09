import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  MoreVertical, 
  MessageCircle, 
  MessageSquare,
  Bot
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  participant1_name: string | null;
  participant2_name: string | null;
  last_message: string | null;
  last_message_at: string | null;
  updated_at: string;
  other_user: {
    unique_number: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

const Chats = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newChatName, setNewChatName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

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
          .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching conversations:', error);
          return;
        }

        setConversations(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  const handleChatClick = (conversation: Conversation) => {
    navigate(`/chat/${conversation.id}`);
  };

  const handleProfileClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    const currentName = user?.id === conversation.participant1_id 
      ? conversation.participant1_name 
      : conversation.participant2_name;
    setNewChatName(currentName || '');
    setShowNameDialog(true);
  };

  const handleSaveName = async () => {
    if (!selectedConversation || !user) return;

    try {
      const updateField = user.id === selectedConversation.participant1_id 
        ? 'participant1_name' 
        : 'participant2_name';

      const { error } = await supabase
        .from('conversations')
        .update({ [updateField]: newChatName || null })
        .eq('id', selectedConversation.id);

      if (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في حفظ الاسم',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, [updateField]: newChatName || null }
          : conv
      ));

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ اسم الدردشة بنجاح',
      });

      setShowNameDialog(false);
    } catch (error) {
      console.error('Error saving name:', error);
    }
  };

  const getChatDisplayName = (conversation: Conversation) => {
    const chatName = user?.id === conversation.participant1_id 
      ? conversation.participant1_name 
      : conversation.participant2_name;
    
    return chatName || conversation.other_user?.display_name || conversation.other_user?.unique_number || 'مستخدم';
  };

  const formatLastMessage = (message: string | null) => {
    if (!message) return 'لا توجد رسائل';
    if (message === 'صورة') return 'صورة';
    return message.length > 30 ? message.substring(0, 30) + '...' : message;
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">ChitChat</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/ai-assistant')}>
                مركز المساعدة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="mb-4">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto" />
            </div>
            <p className="text-muted-foreground mb-2">ما من محادثات هنا بعد</p>
            <p className="text-xs text-muted-foreground">
              ابدأ محادثة جديدة باستخدام الزر أدناه
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="flex items-center p-4 hover:bg-accent">
                <Dialog open={showNameDialog && selectedConversation?.id === conversation.id} onOpenChange={setShowNameDialog}>
                  <DialogTrigger asChild>
                    <button onClick={() => handleProfileClick(conversation)}>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.other_user?.avatar_url || ''} />
                        <AvatarFallback>
                          {getChatDisplayName(conversation).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center space-y-4 py-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={conversation.other_user?.avatar_url || ''} />
                        <AvatarFallback className="text-xl">
                          {getChatDisplayName(conversation).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex space-x-2 space-x-reverse">
                        <Button
                          onClick={() => {
                            setShowNameDialog(false);
                            handleChatClick(conversation);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          مراسلة
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              تحرير الاسم
                            </Button>
                          </DialogTrigger>
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
                                <Button variant="outline" className="flex-1">
                                  إلغاء
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <div 
                  className="flex-1 mr-3 cursor-pointer"
                  onClick={() => handleChatClick(conversation)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">
                      {getChatDisplayName(conversation)}
                    </h3>
                    {conversation.last_message_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.last_message_at).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatLastMessage(conversation.last_message)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <Button
          onClick={() => navigate('/new-chat')}
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg"
          size="sm"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Chats;