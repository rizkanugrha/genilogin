import nodemailer from "nodemailer";

const sendForgotPasswordEmail = async (email, subject, resetUrl) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials are missing in the environment variables");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: `
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetUrl}">Reset Password</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendForgotPasswordEmail;
