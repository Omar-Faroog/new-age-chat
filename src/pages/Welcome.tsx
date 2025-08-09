import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import chitchatLogo from '@/assets/chitchat-logo.png';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/support')}>
              الاتصال بالدعم
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={chitchatLogo} 
            alt="ChitChat" 
            className="w-32 h-32 mx-auto rounded-full shadow-lg"
          />
        </div>

        {/* Terms Text */}
        <div className="mb-8 max-w-sm">
          <p className="text-muted-foreground text-sm leading-relaxed">
            بتسجيلك للدخول فإنك توافق على{' '}
            <button
              onClick={() => navigate('/privacy')}
              className="text-primary hover:text-primary-hover underline"
            >
              سياسة الخصوصية
            </button>
            {' '}و{' '}
            <button
              onClick={() => navigate('/terms')}
              className="text-primary hover:text-primary-hover underline"
            >
              الشروط والأحكام
            </button>
          </p>
        </div>

        {/* Continue Button */}
        <Button 
          onClick={() => navigate('/auth')}
          className="w-full max-w-sm rounded-full h-12 text-base font-medium"
          size="lg"
        >
          الموافقة والمتابعة
        </Button>
      </div>

      {/* Footer */}
      <div className="p-4">
        <p className="text-center text-xs text-muted-foreground">
          ChitChat - تطبيق المراسلة الآمن
        </p>
      </div>
    </div>
  );
};

export default Welcome;