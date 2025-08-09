import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UniqueNumber = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [uniqueNumber, setUniqueNumber] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniqueNumber = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('unique_number')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching unique number:', error);
          return;
        }

        if (data?.unique_number) {
          setUniqueNumber(data.unique_number);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniqueNumber();
  }, [user]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(uniqueNumber);
      setCopied(true);
      toast({
        title: 'تم النسخ',
        description: 'تم نسخ رقمك المميز إلى الحافظة',
      });
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في نسخ الرقم',
        variant: 'destructive',
      });
    }
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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">رقمك المميز</h1>
          <p className="text-muted-foreground leading-relaxed">
            هذا رقمك المميز. شاركه مع أصدقائك ليتواصلوا معك من خلاله
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <span className="text-2xl font-mono font-bold text-primary">
                {uniqueNumber}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            اضغط على أيقونة النسخ لنسخ رقمك المميز
          </p>
        </div>

        <Button 
          onClick={() => navigate('/chats')}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          حسناً
        </Button>
      </div>
    </div>
  );
};

export default UniqueNumber;