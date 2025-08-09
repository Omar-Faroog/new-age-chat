import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
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

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  const email = location.state?.email || user?.email || '';
  const isNewUser = location.state?.isNewUser || false;

  useEffect(() => {
    // If user is confirmed, redirect to unique number page
    if (user && session && user.email_confirmed_at) {
      navigate('/unique-number');
    }
  }, [user, session, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    setShowLogoutDialog(false);
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