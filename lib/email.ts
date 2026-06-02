import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(toEmail: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: toEmail,
    subject: "ยืนยันการลงทะเบียนบัญชีผู้ใช้งาน | ระบบรายงานค่าสาธารณูปโภค",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>ยินดีต้อนรับสู่ระบบรายงานค่าสาธารณูปโภค</h2>
        <p>บัญชีของคุณได้รับการสร้างเรียบร้อยแล้ว กรุณาคลิกที่ปุ่มด้านล่างเพื่อยืนยันอีเมลและตั้งรหัสผ่านสำหรับเข้าใช้งานระบบ</p>
        <div style="margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            ยืนยันอีเมลและตั้งรหัสผ่าน
          </a>
        </div>
        <p>หรือสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ของคุณ:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          *ลิงก์นี้มีอายุการใช้งานจำกัด หากลิงก์หมดอายุ กรุณาติดต่อผู้ดูแลระบบหรือขอลิงก์ใหม่ผ่านหน้าล็อกอิน
        </p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendResetPasswordEmail(toEmail: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: toEmail,
    subject: "รีเซ็ตรหัสผ่าน | ระบบรายงานค่าสาธารณูปโภค",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>การรีเซ็ตรหัสผ่าน</h2>
        <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            ตั้งรหัสผ่านใหม่
          </a>
        </div>
        <p>หรือสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ของคุณ:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          *หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลฉบับนี้
        </p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
