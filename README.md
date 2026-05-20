# 🌉 منصة جِسر — JISR
## منصة تعلم اللغة الصينية HSK 1

---

## 🚀 تشغيل المشروع محلياً

### المتطلبات
- Node.js 18+ أو Bun
- npm أو bun

### الخطوات
```bash
# 1. تثبيت الحزم
npm install
# أو
bun install

# 2. تشغيل السيرفر
npm run dev
# أو
bun dev

# الموقع يعمل على: http://localhost:3000
```

---

## 🏗️ البناء للاستضافة

```bash
# بناء نسخة production
npm run build

# تشغيل النسخة المبنية
npm run start
```

---

## 📁 هيكل المشروع

```
src/
├── app/
│   ├── page.tsx          ← الصفحة الرئيسية (SPA)
│   ├── layout.tsx        ← Layout + Fonts
│   ├── globals.css       ← التصميم الكامل (JISR Design System v3.0)
│   └── api/chat/         ← المساعد الذكي (LLM)
├── components/
│   ├── LoginScreen.tsx   ← تسجيل الدخول
│   ├── LessonSystem.tsx  ← 15 درس تفاعلي
│   ├── HanziSection.tsx  ← كتابة الحروف (HanziWriter)
│   ├── PinyinHub.tsx     ← البينين (4 تبويبات)
│   ├── ExamSimulator.tsx ← محاكي امتحان HSK
│   ├── QASection.tsx     ← أسئلة يومية (22 سؤال)
│   ├── VisualDictionary.tsx ← القاموس البصري (62 كلمة)
│   ├── ConversationsSection.tsx ← المحادثات
│   ├── AchievementsSection.tsx  ← الإنجازات
│   ├── PomodoroTimer.tsx ← مؤقت بومودورو
│   ├── PronunciationPractice.tsx ← تدريب النطق
│   └── theme-toggle.tsx  ← تبديل السمة (داكن/فاتح)
├── data/
│   ├── vocabulary.ts     ← 410 كلمة HSK 1
│   ├── grammar.ts        ← 26 قاعدة نحوية
│   ├── lessons.ts        ← 15 درس كامل
│   ├── conversations.ts  ← 15 محادثة
│   ├── examBank.ts       ← 40 سؤال امتحان
│   ├── visualDict.ts     ← 62 كلمة مصورة
│   ├── stories.ts        ← 7 قصص
│   ├── achievements.ts   ← 9 إنجازات
│   └── pinyin.ts         ← بيانات البينين
└── lib/
    ├── store.ts          ← Zustand (حالة التطبيق)
    └── srs.ts            ← SM-2 Algorithm (مراجعة ذكية)
```

---

## 🎨 مميزات التصميم

- **JISR Design System v3.0** — نظام تصميم كامل مع CSS variables
- **الوضع الداكن/الفاتح** — تبديل تلقائي مع حفظ التفضيل
- **اللون الأساسي: بنفسجي (Violet)** — عصري ومميز لتطبيقات تعلم اللغات
- **RTL عربي كامل** — دعم الكتابة من اليمين لليسار
- **متجاوب** — يعمل على الهاتف والتابلت والحاسوب
- **17 قسم تعليمي** — لوحة تحكم، مفردات، دروس، تمارين، ألعاب، امتحان، محادثات، وأكثر

---

## ⚙️ المتغيرات البيئية (اختياري)

```env
NEXT_PUBLIC_APP_NAME=Jisr
```

---

## 🌐 الاستضافة على Vercel

1. ارفع المشروع على GitHub
2. اتصل بـ Vercel واختر الـ repository
3. Vercel سيكتشف Next.js تلقائياً
4. اضغط Deploy

---

## 📞 التقنيات المستخدمة

- **Next.js 16** + TypeScript + React 19
- **Tailwind CSS 4** + shadcn/ui
- **Zustand** للحالة
- **SM-2** للمراجعة الذكية (SRS)
- **Framer Motion** للرسوم المتحركة
- **HanziWriter** لكتابة الحروف الصينية
- **next-themes** للوضع الداكن/الفاتح
