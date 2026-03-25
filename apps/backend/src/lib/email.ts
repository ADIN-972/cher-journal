import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'noreply@moncherjournal.com';
const APP_NAME = 'Cher Journal';

/**
 * Send a raw email via Resend
 */
async function send(to: string, subject: string, html: string): Promise<boolean> {
  // Dev fallback: log if no API key
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}\n${html}`);
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[EMAIL] Send failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[EMAIL] Send error:', err);
    return false;
  }
}

/**
 * Email verification code (6 digits)
 */
export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  const formattedCode = `${code.slice(0, 3)} ${code.slice(3)}`;
  return send(to, `${formattedCode} — Votre code de verification`, `
    <div style="max-width:480px;margin:0 auto;font-family:'Georgia',serif;color:#2A1720;">
      <div style="text-align:center;padding:40px 20px 20px;">
        <h1 style="font-size:28px;font-style:italic;margin:0;color:#7a5763;">Cher Journal</h1>
        <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#c5a059;margin:8px 0 0;">Verification de votre email</p>
      </div>
      <div style="padding:30px;text-align:center;">
        <p style="font-size:15px;line-height:1.6;color:#555;">
          Bienvenue ! Voici votre code de verification :
        </p>
        <div style="margin:30px 0;padding:20px;background:#f9f5f0;border:2px solid #c5a059;border-radius:12px;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#2A1720;">${formattedCode}</span>
        </div>
        <p style="font-size:13px;color:#999;">Ce code expire dans <strong>15 minutes</strong>.</p>
      </div>
      <div style="text-align:center;padding:20px;border-top:1px solid #eee;">
        <p style="font-size:11px;color:#bbb;">Si vous n'avez pas cree de compte, ignorez cet email.</p>
      </div>
    </div>
  `);
}

/**
 * Password reset email
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  return send(to, 'Reinitialiser votre mot de passe', `
    <div style="max-width:480px;margin:0 auto;font-family:'Georgia',serif;color:#2A1720;">
      <div style="text-align:center;padding:40px 20px 20px;">
        <h1 style="font-size:28px;font-style:italic;margin:0;color:#7a5763;">Cher Journal</h1>
        <p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#c5a059;margin:8px 0 0;">Reinitialisation du mot de passe</p>
      </div>
      <div style="padding:30px;text-align:center;">
        <p style="font-size:15px;line-height:1.6;color:#555;">
          Vous avez demande la reinitialisation de votre mot de passe.
        </p>
        <a href="${resetUrl}" style="display:inline-block;margin:25px 0;padding:14px 40px;background:#7a5763;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:bold;">
          Reinitialiser mon mot de passe
        </a>
        <p style="font-size:13px;color:#999;">Ce lien expire dans <strong>1 heure</strong>.</p>
      </div>
      <div style="text-align:center;padding:20px;border-top:1px solid #eee;">
        <p style="font-size:11px;color:#bbb;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      </div>
    </div>
  `);
}
