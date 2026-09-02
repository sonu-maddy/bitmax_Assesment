import twilio from "twilio";

/*
|--------------------------------------------------------------------------
| Get Twilio Client
|--------------------------------------------------------------------------
*/

const getTwilioClient = () => {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID;

  const authToken =
    process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid) {
    throw new Error(
      "TWILIO_ACCOUNT_SID is missing"
    );
  }

  if (!authToken) {
    throw new Error(
      "TWILIO_AUTH_TOKEN is missing"
    );
  }

  return twilio(
    accountSid,
    authToken
  );
};

/*
|--------------------------------------------------------------------------
| Get Verify Service SID
|--------------------------------------------------------------------------
*/

const getVerifyServiceSid = () => {
  const serviceSid =
    process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!serviceSid) {
    throw new Error(
      "TWILIO_VERIFY_SERVICE_SID is missing"
    );
  }

  return serviceSid;
};

/*
|--------------------------------------------------------------------------
| Normalize Phone Number
|--------------------------------------------------------------------------
*/

export const normalizePhoneNumber = (
  phone
) => {
  if (!phone) {
    throw new Error(
      "Phone number is required"
    );
  }

  let value = phone
    .toString()
    .trim()
    .replace(/\s+/g, "");

  // Already E.164
  if (value.startsWith("+")) {
    return value;
  }

  // Indian 10 digit number
  if (/^[6-9]\d{9}$/.test(value)) {
    return `+91${value}`;
  }

  throw new Error(
    "Invalid phone number"
  );
};

/*
|--------------------------------------------------------------------------
| Send Phone OTP
|--------------------------------------------------------------------------
*/

export const sendPhoneOtp = async (
  phone
) => {
  const normalizedPhone =
    normalizePhoneNumber(phone);

  const twilioClient =
    getTwilioClient();

  const verifyServiceSid =
    getVerifyServiceSid();

  console.log(
    "📱 Sending OTP to:",
    normalizedPhone
  );

  console.log(
    "📱 Verify Service:",
    verifyServiceSid
  );

  const verification =
    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: normalizedPhone,
        channel: "sms",
      });

  console.log(
    "📱 Twilio verification status:",
    verification.status
  );

  return verification;
};

/*
|--------------------------------------------------------------------------
| Verify Phone OTP
|--------------------------------------------------------------------------
*/

export const verifyPhoneOtpCode = async (
  phone,
  otp
) => {
  const normalizedPhone =
    normalizePhoneNumber(phone);

  if (!otp) {
    throw new Error(
      "OTP is required"
    );
  }

  const twilioClient =
    getTwilioClient();

  const verifyServiceSid =
    getVerifyServiceSid();

  console.log(
    "🔐 Checking OTP for:",
    normalizedPhone
  );

  const verificationCheck =
    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: normalizedPhone,
        code: otp.toString().trim(),
      });

  console.log(
    "🔐 Verification status:",
    verificationCheck.status
  );

  return verificationCheck;
};