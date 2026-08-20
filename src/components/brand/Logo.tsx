type Variant = 'icon' | 'icon-white' | 'app'

const SRC: Record<Variant, string> = {
  icon:         '/brand/logo-icon.svg',        // خلفيات فاتحة
  'icon-white': '/brand/logo-icon-white.svg',  // خلفيات داكنة
  app:          '/brand/app-icon.svg',         // مربع كحلي مكتفٍ بذاته
}

/**
 * شعار «جسر إلى الصين».
 * أصول فيكتور معتمدة من ملف الهوية — تُدرَج كما هي بلا إعادة تلوين أو تتبّع.
 * القاعدة: لا تُوضع النسخة الملوّنة على خلفية داكنة — استعمل `icon-white`.
 * لا نمرّ عبر next/image: الـSVG لا يستفيد من تحسين الصور، وتمريره يتطلب
 * تفعيل dangerouslyAllowSVG بلا مقابل.
 */
export function Logo({
  variant = 'icon',
  size = 40,
  className = '',
}: {
  variant?: Variant
  size?: number
  className?: string
}) {
  return (
    <img
      src={SRC[variant]}
      alt="جسر إلى الصين"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
      draggable={false}
    />
  )
}
