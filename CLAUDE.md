# CLAUDE.md

## اقرأ هذا أولاً / Read this first

**قبل أي عمل في هذا المستودع، اقرأ [`PROJECT-MEMORY.md`](./PROJECT-MEMORY.md).**
هو الذاكرة الدائمة للمشروع: فكرة المنصة، مصادرها المؤكَّدة، متطلبات المالك بنصّها،
الأخطاء المفتوحة، والدروس التشغيلية. لا تعد اكتشاف ما هو مكتوب فيه.

Before doing anything in this repo, read `PROJECT-MEMORY.md`. It is the durable
record: the product idea, the confirmed sources, the owner's stated requirements,
the open defects, and the operational lessons. Do not re-derive what it states.

## حقائق سريعة تكرر نسيانها / Frequently re-forgotten facts

- **المستودع** `https://github.com/Jh4k5/Moehsk1` — مربوط بالمحادثة منذ بدايتها.
- **فرع العمل** `claude/platform-business-analysis-p53oiq`.
- **الموقع** `https://moehsk1.vercel.app/` — **محجوب عن شبكة الجلسة**، فلا تحاول جلبه.
- **`jisr-to-china`** (على Vercel وSupabase) هو **موقع شركة الاستشارات**، لا هذه المنصة. لا تخلط بينهما.
- **HSK1 = ٤٠٥ كلمة** (لا ١٥٠). الإجمالي ١٬٠٧٩ كلمة · ٤٨ درساً · ١٩١ وحدة.
- **لا كلمات مرور في المنصة إطلاقاً** — جوجل أو رابط سحري بالبريد فقط، بالتصميم.
- **السعر لا يُكتب في الكود** أبداً — مكانه جدول `app_config` ويُحرَّر من لوحة التحكم.

## قاعدة تشغيلية ملزمة / Mandatory operating rule

الحاوية أُعيد ضبطها ثلاث مرات وارتدّ `HEAD` المحلي عشرات الالتزامات في كل مرة.
**الحقيقة على `origin` لا محلياً.** ابدأ كل جلسة بـ:

```bash
git fetch origin && git status && git log --oneline -3 origin/claude/platform-business-analysis-p53oiq
```

التزم وادفع بخطوات صغيرة متكررة. لا تثق بتقرير وكيل دون قياسه بنفسك.

## التحقق قبل أي دفع / Verify before pushing

```bash
rm -rf .next && npm install
npx tsc --noEmit && npm run lint && npm run build
npm run check && node scripts/check-paywall.js
```
