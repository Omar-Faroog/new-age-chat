import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signUp, validateGmailEmail, validatePassword } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!validateGmailEmail(email)) {
      newErrors.email = 'لا يمكن التسجيل ببريد مؤقت. يجب استخدام @gmail.com';
    }

    if (!validatePassword(password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة وأرقام ورموز';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Try to sign in first
      const { data: signInData, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        // If sign in fails, try to sign up
        const { data: signUpData, error: signUpError } = await signUp(email, password);
        
        if (signUpError) {
          if (signUpError.message.includes('Invalid login credentials')) {
            setErrors({ password: 'كلمة المرور غير صحيحة' });
          } else {
            toast({
              title: 'خطأ',
              description: signUpError.message,
              variant: 'destructive',
            });
          }
        } else {
          // New user - navigate to waiting page
          navigate('/verify', { state: { email, isNewUser: true } });
        }
      } else {
        // Existing user - navigate to waiting page
        navigate('/verify', { state: { email, isNewUser: false } });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearEmailError = () => {
    if (errors.email) {
      setErrors({ ...errors, email: undefined });
    }
  };

  const clearPasswordError = () => {
    if (errors.password) {
      setErrors({ ...errors, password: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
          <p className="text-muted-foreground mt-2">
            ادخل بياناتك للوصول إلى حسابك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearEmailError();
              }}
              placeholder="example@gmail.com"
              className={errors.email ? 'border-destructive' : ''}
              dir="ltr"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearPasswordError();
                }}
                placeholder="كلمة المرور"
                className={errors.password ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التسجيل...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
