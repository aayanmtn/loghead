import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const transporter = {
  sendMail: async (opts: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) => {
    if (resend) {
      const response = await resend.emails.send({
        from: opts.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text || "",
      });

      if (response.error) {
        console.error("Resend API error:", response.error);
      }
      return response;
    }

    // Development fallback: Use Ethereal for testing
    // Create a test account dynamically for each send (or cache it)
    const testAccount = await nodemailer.createTestAccount();

    const transport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const info = await transport.sendMail(opts);
    console.log("📧 Ethereal Email sent!");
    console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
  },
};

export async function sendTeamInviteEmail({
  to,
  toName,
  fromName,
  appUrl,
}: {
  to: string;
  toName: string;
  fromName: string;
  appUrl: string;
}) {
  if (!process.env.SMTP_FROM) {
    throw new Error("SMTP_FROM is required");
  }
  const fromAddress = process.env.SMTP_FROM;

  await transporter.sendMail({
    from: `"${fromName} via Loghead" <${fromAddress}>`,
    to,
    subject: `${fromName} invited you to join Loghead`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #09090b; color: #fafafa; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto;">
            <div style="margin-bottom: 32px;">
              <span style="font-size: 20px; font-weight: 700; color: #10b981;">Loghead</span>
            </div>
            <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">You've been invited</h1>
            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
              <strong style="color: #fafafa;">${fromName}</strong> has invited you to join their Loghead workspace.
            </p>
            <a href="${appUrl}" style="display: inline-block; background: #059669; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px;">
              Accept invitation
            </a>
            <p style="color: #52525b; font-size: 12px; margin-top: 40px;">
              If you weren't expecting this invitation, you can ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `${fromName} has invited you to join their Loghead workspace. Visit ${appUrl} to get started.`,
  });
}

export async function sendVerificationEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  if (!process.env.SMTP_FROM) {
    throw new Error("SMTP_FROM is required");
  }
  const fromAddress = process.env.SMTP_FROM;

  await transporter.sendMail({
    from: `"Loghead" <${fromAddress}>`,
    to,
    subject: `Verify your Loghead account`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #09090b; color: #fafafa; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto;">
            <div style="margin-bottom: 32px;">
              <span style="font-size: 20px; font-weight: 700; color: #10b981;">Loghead</span>
            </div>
            <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">Verify your email</h1>
            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
              Please click the link below to verify your email address.
            </p>
            <a href="${url}" style="display: inline-block; background: #059669; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px;">
              Verify Email
            </a>
            <p style="color: #52525b; font-size: 12px; margin-top: 40px;">
              If you didn't create an account, you can ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Please verify your email address by visiting this link: ${url}`,
  });
}
