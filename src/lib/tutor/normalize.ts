// ─── Text normalization for the tutor engine ───────────────────────────────

/** يزيل التشكيل والتطويل ويوحّد أشكال الألف والتاء المربوطة والألف المقصورة */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ْٰ]/g, '') // tashkeel
    .replace(/ـ/g, '') // tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim()
}

/** يطوي علامات النبرات في البينيين: nǐ hǎo → ni hao، ويوحّد ü → u */
export function stripPinyinTones(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ü/g, 'u')
    .toLowerCase()
}

/** يستخرج مقاطع الهانزي المتتابعة من النص */
export function extractHanzi(text: string): string[] {
  return text.match(/[一-鿿]+/g) || []
}

/** هل يحتوي النص على أي حرف هانزي؟ */
export function hasHanzi(text: string): boolean {
  return /[一-鿿]/.test(text)
}

/** تقسيم لكلمات عربية/لاتينية بعد التطبيع (بدون الهانزي) */
export function tokenize(text: string): string[] {
  return normalizeArabic(text.replace(/[一-鿿]/g, ' '))
    .split(/[\s،؟?!.,:;()«»"'\-—…]+/)
    .filter(Boolean)
}

const STOP_WORDS = new Set([
  'ما', 'ماذا', 'هو', 'هي', 'من', 'في', 'عن', 'على', 'الى', 'لي', 'لك',
  'معنى', 'يعني', 'تعني', 'اشرح', 'اشرحلي', 'ترجم', 'ترجمه', 'كلمه', 'كلمة',
  'بالصيني', 'بالصينيه', 'بالعربي', 'بالعربيه', 'كيف', 'اقول', 'انطق', 'هل',
  'the', 'is', 'in', 'a', 'of', 'to', 'what', 'mean', 'means',
])

/** الرموز الدلالية فقط (يستبعد كلمات الاستفهام والوصل الشائعة) */
export function contentTokens(text: string): string[] {
  return tokenize(text).filter((t) => !STOP_WORDS.has(t) && t.length > 1)
}
