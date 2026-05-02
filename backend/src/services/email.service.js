const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOTPEmail = async (toEmail, otpCode, firstName) => {
  const mailOptions = {
    from: `"EmPay HRMS" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'EmPay - Your Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2563eb;">EmPay HRMS</h2>
        <p>Hello ${firstName || 'User'},</p>
        <p>Your one-time password for login is:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otpCode}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
    text: `EmPay HRMS - Your OTP is: ${otpCode}. Valid for 5 minutes.`,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

const sendCredentialsEmail = async (toEmail, { firstName, loginId, temporaryPassword }) => {
  const mailOptions = {
    from: `"EmPay HRMS" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'EmPay - Your Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2563eb;">Welcome to EmPay HRMS</h2>
        <p>Hello ${firstName},</p>
        <p>Your account has been created. Here are your login credentials:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>Login ID:</strong> ${loginId}</p>
          <p><strong>Email:</strong> ${toEmail}</p>
          <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        </div>
        <p style="color: #dc2626; font-size: 14px;"><strong>You must change your password on first login.</strong></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">This is an automated message from EmPay HRMS.</p>
      </div>
    `,
    text: `Welcome to EmPay HRMS!\n\nLogin ID: ${loginId}\nEmail: ${toEmail}\nTemporary Password: ${temporaryPassword}\n\nYou must change your password on first login.`,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = { sendOTPEmail, sendCredentialsEmail };
