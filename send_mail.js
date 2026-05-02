require('dotenv').config();
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

async function sendMail() {
    const info = await transporter.sendMail({
        from: `"EmPay HRMS" <${process.env.SMTP_USER}>`,
        to: 'chetansshelar202006@gmail.com',
        subject: 'Hello!',
        text: 'Hiiiii',
    });

    console.log('Email sent! Message ID:', info.messageId);
}

sendMail().catch((err) => {
    console.error('Failed to send email:', err.message);
    process.exit(1);
});
