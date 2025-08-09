import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const NewChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [uniqueNumber, setUniqueNumber] = useState('');
  const [chatName, setChatName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateUniqueNumber = (number: string) => {
    const regex = /^73\d{7}$/;
    return regex.test(number);
  };

  const handleStartChat = async () => {
    if (!validateUniqueNumber(uniqueNumber)) {
      setError('الرقم المميز يجب أن يبدأ بـ 73 ويكون مكوناً من 9 أرقام');
      return;
    }

    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Check if the unique number exists
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('user_id, unique_number, display_name')
        .eq('unique_number', uniqueNumber)
        .maybeSingle();

      if (userError) {
        console.error('Error finding user:', userError);
        setError('حدث خطأ أثناء البحث عن المستخدم');
        return;
      }

      if (!targetUser) {
        setError('هذا الرقم غير موجود');
        return;
      }

      if (targetUser.user_id === user.id) {
        setError('لا يمكنك مراسلة نفسك');
        return;
      }

      // Check if conversation already exists
      const { data: existingConversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${targetUser.user_id}),and(participant1_id.eq.${targetUser.user_id},participant2_id.eq.${user.id})`)
        .maybeSingle();

      if (convError) {
        console.error('Error checking conversation:', convError);
        setError('حدث خطأ أثناء التحقق من المحادثة');
        return;
      }

      if (existingConversation) {
        // Navigate to existing conversation
        navigate(`/chat/${existingConversation.id}`);
        return;
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant1_id: user.id,
          participant2_id: targetUser.user_id,
          participant1_name: chatName || null,
          participant2_name: null,
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        setError('فشل في إنشاء المحادثة');
        return;
      }

      // Navigate to new conversation
      navigate(`/chat/${newConversation.id}`);

    } catch (error) {
      console.error('Error:', error);
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/chats')}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">دردشة جديدة</h1>
        <div className="w-8"></div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-sm mx-auto space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unique-number">الرقم المميز *</Label>
            <Input
              id="unique-number"
              type="text"
              value={uniqueNumber}
              onChange={(e) => {
                setUniqueNumber(e.target.value);
                clearError();
              }}
              placeholder="73xxxxxxx"
              className={error ? 'border-destructive' : ''}
              dir="ltr"
              maxLength={9}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chat-name">اسم الدردشة (اختياري)</Label>
            <Input
              id="chat-name"
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="أدخل اسماً للدردشة"
            />
            <p className="text-xs text-muted-foreground">
              يمكنك تغيير هذا الاسم لاحقاً
            </p>
          </div>
        </div>

        <Button 
          onClick={handleStartChat}
          className="w-full h-12 text-base font-medium"
          disabled={loading || !uniqueNumber}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              جاري البحث...
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4 mr-2" />
              مراسلة
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NewChat;