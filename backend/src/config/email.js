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
        if (!emailUser || !emailPassword) {
            throw new Error(
                "EMAIL_USER or EMAIL_PASSWORD is missing in .env"
            );
        }

        await transporter.verify();

        console.log("SMTP connection successful");

        const info = await transporter.sendMail({
            from: `"Bitmax Authentication" <${emailUser}>`,
            to: email,
            subject: "Your Bitmax OTP",

            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <title>Bitmax OTP</title>
                </head>

                <body style="
                    margin: 0;
                    padding: 0;
                    background: #f1f5f9;
                    font-family: Arial, sans-serif;
                ">

                    <div style="
                        max-width: 500px;
                        margin: 40px auto;
                        background: white;
                        padding: 30px;
                        border-radius: 12px;
                    ">

                        <h2 style="
                            color: #2563eb;
                            text-align: center;
                        ">
                            Bitmax Authentication
                        </h2>

                        <p style="color: #475569;">
                            Hello,
                        </p>

                        <p style="color: #475569;">
                            Your One-Time Password (OTP) is:
                        </p>

                        <div style="
                            text-align: center;
                            margin: 25px 0;
                        ">
                            <span style="
                                display: inline-block;
                                background: #eff6ff;
                                color: #2563eb;
                                font-size: 32px;
                                font-weight: bold;
                                letter-spacing: 8px;
                                padding: 15px 25px;
                                border-radius: 10px;
                            ">
                                ${otp}
                            </span>
                        </div>

                        <p style="color: #64748b;">
                            This OTP is valid for <strong>5 minutes</strong>.
                        </p>

                        <p style="color: #64748b;">
                            If you did not request this OTP, please ignore
                            this email.
                        </p>

                        <hr style="
                            border: none;
                            border-top: 1px solid #e2e8f0;
                            margin: 25px 0;
                        " />

                        <p style="
                            text-align: center;
                            color: #94a3b8;
                            font-size: 12px;
                        ">
                            © 2026 Bitmax Authentication
                        </p>

                    </div>

                </body>
                </html>
            `,
        });

        console.log(
            "OTP email sent successfully:",
            info.messageId
        );

        return info;

    } catch (error) {
        console.error("Email sending error:", error);
        throw error;
    }
};