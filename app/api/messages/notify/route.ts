import { Resend } from "resend"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function POST(req: Request) {
  try {
    // Auth check — only authenticated users can trigger emails
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set, skipping email notification")
      return NextResponse.json({ success: false, reason: "no_api_key" })
    }

    const { sellerEmail, sellerName, buyerName, listingTitle, messageContent } = await req.json()

    if (!sellerEmail || !buyerName || !listingTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const resend = new Resend(apiKey)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://umich-market.vercel.app"

    await resend.emails.send({
      from: "WolverineMarket <onboarding@resend.dev>",
      to: sellerEmail,
      subject: `New message about "${escapeHtml(listingTitle)}"`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00274C;">New message on WolverineMarket</h2>
          <p><strong>From:</strong> ${escapeHtml(buyerName)}</p>
          <p><strong>About:</strong> ${escapeHtml(listingTitle)}</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(messageContent || "")}</p>
          </div>
          <a href="${appUrl}/dashboard"
             style="display: inline-block; background: #FFCB05; color: #00274C; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View in Dashboard
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 24px;">
            You received this because someone messaged you on WolverineMarket.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Email notification failed:", err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
