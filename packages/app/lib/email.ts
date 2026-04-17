import nodemailer from "nodemailer";

let transporter:
  | nodemailer.Transporter
  | { sendMail: (opts: any) => Promise<any> };

if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  // Development fallback: Use Ethereal for testing
  // console.log("⚠️ No SMTP config found. Using Ethereal for development emails.");

  transporter = {
    sendMail: async (mailOptions: any) => {
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

      const info = await transport.sendMail(mailOptions);
      console.log("📧 Ethereal Email sent!");
      console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
      return info;
    },
  };
}

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
  const fromAddress = process.env.SMTP_FROM ?? process.env.SMTP_USER;

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
