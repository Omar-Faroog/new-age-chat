import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { signOut } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [checking, setChecking] = useState(false);
  
  const email = location.state?.email || user?.email || '';
  const isNewUser = location.state?.isNewUser || false;

  useEffect(() => {
    // Auto-check for confirmation status every 2 seconds
    const checkConfirmation = async () => {
      if (user && session) {
        // Refresh session to get latest user data
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (newSession && newSession.user.email_confirmed_at) {
          navigate('/unique-number');
        }
      }
    };

    // Check immediately
    checkConfirmation();

    // Set up interval to check every 2 seconds
    const interval = setInterval(checkConfirmation, 2000);

    return () => clearInterval(interval);
  }, [user, session, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    setShowLogoutDialog(false);
  };

  const handleManualCheck = async () => {
    if (checking) return;
    
    setChecking(true);
    try {
      // Refresh session to get latest user data
      const { data: { session: newSession } } = await supabase.auth.getSession();
      if (newSession && newSession.user.email_confirmed_at) {
        navigate('/unique-number');
      } else {
        toast({
          title: "لم يتم التحقق بعد",
          description: "يرجى النقر على الرابط في بريدك الإلكتروني أولاً",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      toast({
        title: "خطأ في التحقق",
        description: "حدث خطأ أثناء التحقق من حالة البريد الإلكتروني",
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full space-y-6 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">
            {isNewUser ? 'مرحباً بك!' : 'مرحباً بعودتك!'}
          </h1>
          
          <div className="space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              {isNewUser 
                ? 'تم إنشاء حسابك بنجاح! أكد لنا أنك صاحب الحساب عبر النقر على الرابط الذي أرسلناه إلى بريدك:'
                : 'أكد لنا أنك صاحب الحساب عبر النقر على الرابط الذي أرسلناه إلى بريدك:'
              }
            </p>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-primary">{email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleManualCheck}
            disabled={checking}
            className="w-full h-12 text-base"
          >
            {checking ? 'جاري التحقق...' : 'تحقق الآن'}
          </Button>

          <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full h-12 text-base"
              >
                تغيير الحساب
              </Button>
            </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد تسجيل الخروج</AlertDialogTitle>
              <AlertDialogDescription>
                هل تريد تسجيل الخروج والعودة إلى صفحة تسجيل الدخول؟
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>استمرار</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                تسجيل خروج
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="pt-8">
          <p className="text-xs text-muted-foreground">
            لم تستلم البريد؟ تأكد من صندوق البريد المؤجل أو البريد المزعج
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;