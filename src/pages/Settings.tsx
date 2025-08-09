import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Copy, Check, Moon, Sun, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTheme } from 'next-themes';

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(4);
  const [countdownActive, setCountdownActive] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdownActive && logoutCountdown > 0) {
      interval = setInterval(() => {
        setLogoutCountdown(prev => prev - 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [countdownActive, logoutCountdown]);

  const handleCopyUniqueNumber = () => {
    if (profile?.unique_number) {
      navigator.clipboard.writeText(profile.unique_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      // Upload to Supabase storage would go here
      toast({
        title: 'قريباً',
        description: 'ميزة تحميل الصور ستكون متاحة قريباً',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الصورة',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
    setCountdownActive(true);
    setLogoutCountdown(4);
  };

  const confirmLogout = async () => {
    try {
      await signOut();
      navigate('/welcome');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تسجيل الخروج',
        variant: 'destructive',
      });
    }
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
    setCountdownActive(false);
    setLogoutCountdown(4);
  };

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return 'فاتح';
      case 'dark':
        return 'داكن';
      default:
        return 'النظام';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => navigate('/chats')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">الإعدادات</h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-2xl">
                {profile?.display_name?.charAt(0) || profile?.unique_number?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <p className="text-sm text-muted-foreground">انقر لتغيير الصورة</p>
        </div>

        {/* Settings Items */}
        <div className="space-y-1">
          {/* Unique Number */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <h3 className="font-medium">رقمك المميز</h3>
              <p className="text-sm text-muted-foreground">{profile?.unique_number}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUniqueNumber}
              className="flex items-center space-x-2 space-x-reverse"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>نسخ</span>
                </>
              )}
            </Button>
          </div>

          {/* Theme Selection */}
          <div className="p-4 rounded-lg border border-border">
            <h3 className="font-medium mb-3">المظهر</h3>
            <div className="grid grid-cols-3 gap-2">
              {['light', 'dark', 'system'].map((themeOption) => (
                <Button
                  key={themeOption}
                  variant={theme === themeOption ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme(themeOption)}
                  className="flex flex-col items-center space-y-1 h-16"
                >
                  {getThemeIcon(themeOption)}
                  <span className="text-xs">{getThemeLabel(themeOption)}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <h3 className="font-medium">الاسم المعروض</h3>
              <p className="text-sm text-muted-foreground">
                {profile?.display_name || 'لم يتم تعيين اسم'}
              </p>
            </div>
            <Button variant="outline" size="sm">
              تعديل
            </Button>
          </div>
        </div>

        {/* Logout Section */}
        <div className="pt-6">
          <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                تسجيل الخروج
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">تأكيد تسجيل الخروج</h3>
                <p className="text-muted-foreground">
                  هل أنت متأكد من رغبتك في تسجيل الخروج؟
                </p>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant="destructive"
                    onClick={confirmLogout}
                    disabled={logoutCountdown > 0}
                    className="flex-1"
                  >
                    {logoutCountdown > 0 ? `تسجيل خروج (${logoutCountdown})` : 'تسجيل خروج'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelLogout}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Settings;