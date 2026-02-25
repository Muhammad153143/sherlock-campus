const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendEmail = async ({
  email,
  subject,
  message,
  templateData,
  type,
  triggeredBy,
  attachments
}) => {
  try {
    const mailOptions = {
      from: `"Sherlock Lost & Found" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: message
        ? `<p>${message}</p>`
        : `
          <h2>${templateData?.title || "Sherlock Notification"}</h2>
          <p>Hello ${templateData?.name || "Student"},</p>
          <p>${templateData?.title}</p>
          <hr/>
          <p>Please visit the admin office.</p>
        `,
      attachments: attachments || []
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);

    return info;

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};
