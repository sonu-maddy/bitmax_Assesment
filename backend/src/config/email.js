import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD?.trim();

console.log("Email:", emailUser);
console.log("Password loaded:", !!emailPassword);
console.log("Password length:", emailPassword?.length);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

export const sendOtpEmail = async (email, otp) => {
  try {
    await transporter.verify();

    console.log("SMTP connection successful");

    await transporter.sendMail({
      from: `"Bitmax Authentication" <${emailUser}>`,
      to: email,
      subject: "Your Login OTP",

      html: `
        <h2>Bitmax Authentication</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    });

    console.log("OTP email sent successfully");

  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};