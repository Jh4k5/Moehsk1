import { NextResponse, type NextRequest } from 'next/server'

// ─── License validation endpoint ───────────────────────────
// This validates license keys (can be extended to use Cloudflare Workers, Gumroad API, etc.)

// For demo/testing, we accept specific keys
const VALID_KEYS = [
  'MUDANN-TEST-KEY-0001',
  'MUDANN-TEST-KEY-0002',
  'MUDANN-BETA-LAUNCH',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { license_key } = body

    if (!license_key || typeof license_key !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'مفتاح الترخيص مطلوب' },
        { status: 400 }
      )
    }

    const key = license_key.trim().toUpperCase()

    // ─── Demo/Testing validation ──────────────────────────
    if (VALID_KEYS.includes(key)) {
      return NextResponse.json({ valid: true, message: 'تم التفعيل بنجاح' })
    }

    // ─── Gumroad License API (Production) ─────────────────
    // Uncomment this block and add your Gumroad API credentials
    /*
    const GUMROAD_PRODUCT_ID = 'YOUR_PRODUCT_ID'
    const response = await fetch(
      `https://api.gumroad.com/v2/licenses/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          product_id: GUMROAD_PRODUCT_ID,
          license_key: key,
        }),
      }
    )

    const data = await response.json()

    if (data.success && data.uses < data.purchase?.quantity) {
      // Increment uses
      await fetch(`https://api.gumroad.com/v2/licenses/increment_uses_count`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          product_id: GUMROAD_PRODUCT_ID,
          license_key: key,
        }),
      })

      return NextResponse.json({ valid: true, message: 'تم التفعيل بنجاح' })
    }
    */

    // ─── Cloudflare Worker validation (Production) ────────
    // Uncomment to use a Cloudflare Worker for validation
    /*
    const workerUrl = process.env.LICENSE_WORKER_URL
    if (workerUrl) {
      const workerRes = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: key }),
      })
      const workerData = await workerRes.json()
      if (workerData.valid) {
        return NextResponse.json({ valid: true, message: 'تم التفعيل بنجاح' })
      }
    }
    */

    return NextResponse.json(
      { valid: false, error: 'مفتاح خاطئ — تحقق من بريدك الإلكتروني' },
      { status: 200 }
    )
  } catch (error) {
    console.error('License validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'خطأ في الخادم، حاول مجدداً' },
      { status: 500 }
    )
  }
}
