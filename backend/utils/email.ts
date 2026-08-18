import nodemailer from "nodemailer";

// created lazily inside sendEmail (not at module scope) so it always reads
// SMTP_* after dotenv has actually populated process.env
function buildTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        } : undefined,
    });
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!process.env.SMTP_HOST) {
        // no SMTP configured (e.g. local dev) — log instead of silently pretending it sent
        console.warn(`SMTP not configured; skipping email "${subject}" to ${to}`);
        return;
    }
    const transporter = buildTransporter();
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || "Trainix <no-reply@trainix.app>",
        to,
        subject,
        html,
    });
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    await sendEmail(
        to,
        "Reset your Trainix password",
        `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #1f4d36;">Reset your password</h2>
                <p>We received a request to reset the password for your Trainix account. This link expires in 1 hour.</p>
                <p><a href="${resetLink}" style="display: inline-block; background: #2f6f4e; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Reset password</a></p>
                <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
            </div>
        `,
    );
}
