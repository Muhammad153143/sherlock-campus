const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];

apiKey.apiKey = process.env.BREVO_API_KEY;

exports.sendEmail = async ({
  email,
  subject,
  message,
  templateData,
  attachments
}) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const htmlContent = message
      ? `<p>${message}</p>`
      : generateEmailTemplate(templateData);

    const sendSmtpEmail = {
      to: [{ email }],
      sender: { 
        email: process.env.BREVO_SENDER_EMAIL,
        name: "Sherlock Lost & Found"
      },
      subject,
      htmlContent
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("✅ Email sent:", data.messageId);
    return data;

  } catch (error) {
    console.error("❌ Email sending failed:", error.response?.body || error);
    throw error;
  }
};
