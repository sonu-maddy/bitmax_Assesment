import nodemailer from "nodemailer";


const getEmailTransporter = () => {

  const emailUser =
    process.env.EMAIL_USER;

  const emailPassword =
    process.env.EMAIL_PASSWORD?.trim();


  console.log(
    "========== EMAIL ENV CHECK =========="
  );

  console.log(
    "EMAIL_USER:",
    emailUser
      ? "LOADED"
      : "MISSING"
  );

  console.log(
    "EMAIL_PASSWORD:",
    emailPassword
      ? "LOADED"
      : "MISSING"
  );

  console.log(
    "====================================="
  );


  if (!emailUser) {
    throw new Error(
      "EMAIL_USER is missing"
    );
  }

  if (!emailPassword) {
    throw new Error(
      "EMAIL_PASSWORD is missing"
    );
  }


  return nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 465,

    secure: true,

    auth: {
      user: emailUser,
      pass: emailPassword,
    },

  });
};


export const sendOtpEmail = async (
  email,
  otp
) => {

  try {

    const emailUser =
      process.env.EMAIL_USER;


    const transporter =
      getEmailTransporter();


    console.log(
      "📧 Sending OTP to:",
      email
    );


    await transporter.verify();


    console.log(
      "✅ SMTP connection successful"
    );


    const info =
      await transporter.sendMail({

        from:
          `"Bitmax Authentication" <${emailUser}>`,

        to: email,

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

          </div>
        `,
      });


    console.log(
      "✅ Email sent:",
      info.messageId
    );


    return info;

  } catch (error) {

    console.error(
      "❌ SMTP ERROR MESSAGE:",
      error.message
    );

    console.error(
      "❌ SMTP ERROR CODE:",
      error.code
    );

    console.error(
      "❌ SMTP RESPONSE:",
      error.response
    );

    throw error;
  }
};