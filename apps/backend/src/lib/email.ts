/**
 * Email service stub
 *
 * For development: logs reset URL to console
 * For production: replace with actual email service (nodemailer, resend, sendgrid, etc.)
 */

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  // Development: log to console
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║        PASSWORD RESET LINK (Development Mode)            ║
╠═══════════════════════════════════════════════════════════╣
║ To:  ${to}
║ URL: ${resetUrl}
║
║ This URL will be valid for 1 hour.
║ Copy the link above and paste into your browser.
╚═══════════════════════════════════════════════════════════╝
  `);

  // TODO: In production, replace the console.log above with actual email sending:
  // Example with nodemailer:
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   secure: true,
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS,
  //   },
  // });
  //
  // await transporter.sendMail({
  //   from: process.env.SMTP_FROM,
  //   to,
  //   subject: 'Réinitialiser votre mot de passe - Cher Journal',
  //   html: `
  //     <h2>Réinitialiser votre mot de passe</h2>
  //     <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
  //     <p><a href="${resetUrl}">Cliquez ici pour réinitialiser votre mot de passe</a></p>
  //     <p>Ce lien expire dans 1 heure.</p>
  //   `,
  // });
}
