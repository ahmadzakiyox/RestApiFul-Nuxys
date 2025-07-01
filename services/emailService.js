const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Buat transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true untuk port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
  });

  // 2) Definisikan opsi email
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3) Kirim email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;