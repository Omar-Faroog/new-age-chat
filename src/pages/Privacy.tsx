import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

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
        <h1 className="text-lg font-semibold">سياسة الخصوصية</h1>
        <div className="w-8"></div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="prose prose-gray dark:prose-invert max-w-none text-right" dir="rtl">
          <h2 className="text-2xl font-bold mb-6">سياسة الخصوصية - ChitChat</h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold mb-3">1. المعلومات التي نجمعها</h3>
              <p className="text-muted-foreground leading-relaxed">
                نحن نجمع المعلومات التي تقدمها لنا مباشرة عند تسجيل حساب، مثل عنوان البريد الإلكتروني وكلمة المرور. كما نجمع الرسائل والمحتوى الذي ترسله من خلال تطبيقنا لتقديم الخدمة.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">2. كيف نستخدم معلوماتك</h3>
              <p className="text-muted-foreground leading-relaxed">
                نستخدم معلوماتك لتقديم خدمة المراسلة، والحفاظ على أمان حسابك، وتحسين تجربة المستخدم. لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة لأغراض تجارية.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">3. تشفير الرسائل</h3>
              <p className="text-muted-foreground leading-relaxed">
                جميع رسائلك محمية بتشفير متقدم أثناء الإرسال والتخزين. نحن نلتزم بأعلى معايير الأمان لحماية خصوصيتك.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">4. مشاركة المعلومات</h3>
              <p className="text-muted-foreground leading-relaxed">
                لا نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية: بموافقتك الصريحة، لأغراض قانونية، أو لحماية حقوقنا أو حقوق المستخدمين الآخرين.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">5. حفظ البيانات</h3>
              <p className="text-muted-foreground leading-relaxed">
                نحتفظ بمعلوماتك طالما كان حسابك نشطاً. يمكنك حذف حسابك في أي وقت، وسيتم حذف جميع بياناتك خلال 30 يوماً.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">6. حقوقك</h3>
              <p className="text-muted-foreground leading-relaxed">
                لديك الحق في الوصول إلى معلوماتك الشخصية، وتصحيحها، وحذفها. يمكنك أيضاً تقييد معالجة بياناتك أو طلب نسخة من معلوماتك.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">7. الأطفال</h3>
              <p className="text-muted-foreground leading-relaxed">
                خدمتنا غير مخصصة للأطفال دون سن 13 عاماً. لا نجمع معلومات شخصية من الأطفال دون موافقة الوالدين.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">8. تحديث السياسة</h3>
              <p className="text-muted-foreground leading-relaxed">
                قد نحدث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات مهمة عبر البريد الإلكتروني أو من خلال التطبيق.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">9. اتصل بنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا على: contactchitchat@gmail.com
              </p>
            </section>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;