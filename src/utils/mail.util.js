import sgMail from "@sendgrid/mail";

export const sendVerificationEmail = async (to, confirmationLink) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("Missing SENDGRID_API_KEY environment variable");
    }

    if (!process.env.SENDGRID_VERIFIED_SENDER_EMAIL) {
      throw new Error(
        "Missing SENDGRID_VERIFIED_SENDER_EMAIL environment variable"
      );
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_VERIFIED_SENDER_EMAIL,
        name: "Quizard Support",
      },
      subject: "Verify Your Quizard Account",
      html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; text-align: center;">
      <div style="background-color: #ffffff; max-width: 500px; margin: auto; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <img src="https://img.freepik.com/premium-vector/wizard-cartoon-vector-app-design_1080480-46895.jpg" alt="Quizard Logo" width="120" style="margin-bottom: 20px; border-radius: 10px;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p style="color: #555; font-size: 15px;">
          Thanks for signing up for <strong>Quizard</strong>! Please verify your email to activate your account.
        </p>
        <a href="${confirmationLink}" target="_blank"
           style="display: inline-block; margin-top: 20px; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Verify Email
        </a>
        <p style="font-size: 12px; color: #777; margin-top: 25px;">
          If you didn’t create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `,
    };

    await sgMail.send(msg);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};
