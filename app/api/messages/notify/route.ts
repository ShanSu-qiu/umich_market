import { Resend } from "resend"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set, skipping email notification")
      return NextResponse.json({ success: false, reason: "no_api_key" })
    }

    const { sellerEmail, sellerName, buyerName, listingTitle, messageContent } = await req.json()

    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: "WolverineMarket <onboarding@resend.dev>",
      to: sellerEmail,
      subject: `New message about "${listingTitle}"`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00274C;">New message on WolverineMarket</h2>
          <p><strong>From:</strong> ${buyerName}</p>
          <p><strong>About:</strong> ${listingTitle}</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${messageContent}</p>
          </div>
          <a href="https://umich-market.vercel.app/dashboard"
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
