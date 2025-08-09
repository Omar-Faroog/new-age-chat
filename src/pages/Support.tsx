import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const faqs = [
  {
    question: 'كيف يمكنني إنشاء حساب جديد؟',
    answer: 'يمكنك إنشاء حساب جديد بسهولة من خلال الذهاب إلى صفحة تسجيل الدخول وإدخال بريدك الإلكتروني وكلمة المرور. سيتم إرسال رابط تأكيد إلى بريدك الإلكتروني.'
  },
  {
    question: 'ما هو الرقم المميز وكيف أستخدمه؟',
    answer: 'الرقم المميز هو رقم فريد مكون من 9 أرقام يبدأ بـ 73. يمكنك مشاركة هذا الرقم مع أصدقائك ليتمكنوا من مراسلتك من خلال التطبيق.'
  },
  {
    question: 'هل يمكنني تغيير اسم الدردشة؟',
    answer: 'نعم، يمكنك تغيير اسم أي دردشة من خلال الضغط على صورة المستخدم في قائمة الدردشات، ثم اختيار أيقونة التحرير وإدخال الاسم الجديد.'
  },
  {
    question: 'كيف يمكنني حظر مستخدم؟',
    answer: 'يمكنك حظر أي مستخدم من خلال فتح دردشته والضغط على النقاط الثلاث في الأعلى، ثم اختيار "حظر" من القائمة.'
  },
  {
    question: 'ما هي القيود على المساعد الذكي؟',
    answer: 'يمكنك طرح 3 أسئلة فقط كل 5 ساعات على المساعد الذكي. بعد انتهاء المحاولات، ستحتاج إلى الانتظار 5 ساعات للحصول على 3 محاولات جديدة.'
  },
  {
    question: 'هل يمكنني إرسال الصور؟',
    answer: 'نعم، يمكنك إرسال الصور من خلال الضغط على أيقونة المرفقات بجانب حقل كتابة الرسالة.'
  }
];

const Support = () => {
  const navigate = useNavigate();
  const [openItem, setOpenItem] = useState<number | null>(null);

  const handleContactSupport = () => {
    const subject = encodeURIComponent('طلب دعم - ChitChat');
    const body = encodeURIComponent('مرحباً،\n\nأحتاج مساعدة في:\n\n');
    window.location.href = `mailto:contactchitchat@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">مركز المساعدة</h1>
        <div className="w-8"></div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">الأسئلة الشائعة</h2>
          
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <Collapsible
                key={index}
                open={openItem === index}
                onOpenChange={(isOpen) => setOpenItem(isOpen ? index : null)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto text-right border border-border rounded-lg hover:bg-accent"
                  >
                    <span className="text-sm font-medium">{faq.question}</span>
                    {openItem === index ? (
                      <ChevronUp className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed text-right">
                    {faq.answer}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* Contact Support Button */}
        <div className="mt-8">
          <Button 
            onClick={handleContactSupport}
            className="w-full rounded-full h-12 text-base font-medium"
            size="lg"
          >
            التواصل مع فريق الدعم
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Support;