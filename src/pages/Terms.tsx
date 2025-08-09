import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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
        <h1 className="text-lg font-semibold">الشروط والأحكام</h1>
        <div className="w-8"></div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="prose prose-gray dark:prose-invert max-w-none text-right" dir="rtl">
          <h2 className="text-2xl font-bold mb-6">الشروط والأحكام - ChitChat</h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold mb-3">1. قبول الشروط</h3>
              <p className="text-muted-foreground leading-relaxed">
                باستخدام تطبيق ChitChat، فإنك توافق على هذه الشروط والأحكام. إذا لم توافق على أي جزء من هذه الشروط، فلا يحق لك استخدام الخدمة.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">2. وصف الخدمة</h3>
              <p className="text-muted-foreground leading-relaxed">
                ChitChat هو تطبيق مراسلة يتيح للمستخدمين التواصل مع بعضهم البعض من خلال الرسائل النصية والصور. نحن نقدم أيضاً مساعد ذكي للمساعدة في الاستفسارات.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">3. التسجيل والحساب</h3>
              <p className="text-muted-foreground leading-relaxed">
                يجب أن تكون 13 عاماً على الأقل لاستخدام هذه الخدمة. يجب تقديم معلومات دقيقة عند التسجيل وحماية كلمة المرور الخاصة بك. أنت مسؤول عن جميع الأنشطة التي تحدث في حسابك.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">4. الاستخدام المقبول</h3>
              <p className="text-muted-foreground leading-relaxed">
                يُحظر استخدام الخدمة لأي أغراض غير قانونية أو ضارة، بما في ذلك التحرش، أو نشر محتوى مسيء، أو انتهاك حقوق الآخرين. نحتفظ بالحق في إنهاء الحسابات التي تنتهك هذه القواعد.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">5. المحتوى والملكية الفكرية</h3>
              <p className="text-muted-foreground leading-relaxed">
                أنت تحتفظ بملكية المحتوى الذي ترسله، لكنك تمنحنا ترخيصاً لتقديم الخدمة. يُحظر نسخ أو توزيع أي جزء من التطبيق دون إذن.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">6. الخصوصية والأمان</h3>
              <p className="text-muted-foreground leading-relaxed">
                نحن نلتزم بحماية خصوصيتك وفقاً لسياسة الخصوصية الخاصة بنا. لا نضمن أن الخدمة ستكون خالية من الأخطاء أو متاحة دائماً.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">7. الحدود والمسؤولية</h3>
              <p className="text-muted-foreground leading-relaxed">
                نحن غير مسؤولين عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام الخدمة. استخدامك للخدمة يكون على مسؤوليتك الخاصة.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">8. إنهاء الخدمة</h3>
              <p className="text-muted-foreground leading-relaxed">
                يمكنك إنهاء حسابك في أي وقت. نحن نحتفظ بالحق في إنهاء أو تعليق حسابك إذا انتهكت هذه الشروط.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">9. التحديثات والتغييرات</h3>
              <p className="text-muted-foreground leading-relaxed">
                نحتفظ بالحق في تحديث هذه الشروط في أي وقت. سنخطرك بالتغييرات المهمة، واستمرار استخدامك للخدمة يعني موافقتك على الشروط المحدثة.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">10. القانون المعمول به</h3>
              <p className="text-muted-foreground leading-relaxed">
                تخضع هذه الشروط للقوانين المعمول بها في المملكة العربية السعودية. أي نزاعات ستحل من خلال المحاكم المختصة.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">11. معلومات الاتصال</h3>
              <p className="text-muted-foreground leading-relaxed">
                لأي أسئلة حول هذه الشروط والأحكام، يرجى التواصل معنا على: contactchitchat@gmail.com
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

export default Terms;