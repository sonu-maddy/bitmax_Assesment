import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
    try {
        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_PASSWORD?.trim();

        console.log("Mailer Email:", emailUser);
        console.log("Mailer Password Loaded:", !!emailPassword);

        if (!emailUser || !emailPassword) {
            throw new Error(
                "EMAIL_USER or EMAIL_PASSWORD is missing in .env"
            );
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: emailUser,
                pass: emailPassword,
            },
        });

        await transporter.verify();

        console.log("✅ SMTP connection successful");

        const info = await transporter.sendMail({
            from: `"Bitmax Authentication" <${emailUser}>`,
            to: email,
            subject: "Your Bitmax OTP",

            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Bitmax Authentication</h2>

                    <p>Your OTP is:</p>

                    <h1>${otp}</h1>

                    <p>This OTP is valid for 5 minutes.</p>

                    <p>
                        If you did not request this OTP,
                        please ignore this email.
                    </p>
                </div>
            `,
        });

        console.log("✅ OTP email sent:", info.messageId);

        return info;

    } catch (error) {
        console.error("❌ Email sending error:", error);
        throw error;
    }
};