import { Resend } from "resend";

const resend = new Resend(
    process.env.RESEND_API_KEY
);


export const sendOtpEmail = async (
    email,
    otp
) => {

    try {

        if (!process.env.RESEND_API_KEY) {
            throw new Error(
                "RESEND_API_KEY is missing"
            );
        }


        const fromEmail =
            process.env.EMAIL_FROM ||
            "onboarding@resend.dev";


        console.log(
            "📧 Sending OTP to:",
            email
        );


        const { data, error } =
            await resend.emails.send({

                from:
                    `Bitmax Authentication <${fromEmail}>`,

                to: [email],

                subject:
                    "Your Bitmax Verification OTP",

                html: `
                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;
                        padding: 30px;
                        border: 1px solid #ddd;
                        border-radius: 10px;
                    ">

                        <h2>
                            Bitmax Authentication
                        </h2>

                        <p>
                            Your OTP for login is:
                        </p>

                        <div style="
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            margin: 25px 0;
                        ">
                            ${otp}
                        </div>

                        <p>
                            This OTP is valid for
                            <strong>5 minutes</strong>.
                        </p>

                        <p>
                            If you did not request this OTP,
                            please ignore this email.
                        </p>

                        <hr />

                        <p style="
                            font-size: 12px;
                            color: #777;
                        ">
                            This is an automated email from
                            Bitmax Authentication.
                        </p>

                    </div>
                `,
            });


        if (error) {

            console.error(
                "❌ Resend API Error:",
                error
            );

            throw new Error(
                error.message ||
                "Failed to send email"
            );
        }


        console.log(
            "✅ OTP email sent successfully:",
            data?.id
        );


        return data;

    } catch (error) {

        console.error(
            "❌ Email sending error:",
            error
        );

        throw error;
    }
};