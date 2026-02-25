const axios = require('axios');
const EmailLog = require('../models/EmailLog');

// 1. HTML Template Generator (UNCHANGED STRUCTURE)
const generateEmailTemplate = (data) => {
    const { title, name, details, actionUrl, actionText } = data;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: #2c3e50; color: #fff; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .item-card { background: #eef2f7; padding: 15px; border-left: 5px solid #3498db; margin: 20px 0; border-radius: 4px; }
            .details-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .details-table td { padding: 8px; border-bottom: 1px solid #ddd; }
            .details-table td:first-child { font-weight: bold; width: 40%; color: #555; }
            .btn { display: inline-block; background: #27ae60; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; margin-top: 20px; }
            .footer { background: #ecf0f1; text-align: center; padding: 15px; font-size: 12px; color: #7f8c8d; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SherLock 🔍 Notification</h1>
            </div>
            <div class="content">
                <h2>Hello ${name || 'Student'},</h2>
                <p>${title}</p>
                
                <div class="item-card">
                    <h3>Item Details</h3>
                    <table class="details-table">
                        ${details ? Object.entries(details).map(([key, value]) => `
                            <tr>
                                <td>${key}</td>
                                <td>${value}</td>
                            </tr>
                        `).join('') : ''}
                    </table>
                </div>

                ${actionUrl ? `<div style="text-align: center;"><a href="${actionUrl}" class="btn">${actionText || 'View Details'}</a></div>` : ''}
                
                <p>If you have any questions, please visit the Admin Office.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} SherLock Smart Campus System. All rights reserved.</p>
                <p>This is an automated message.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// 2. Dummy verifyConnection (kept for structure compatibility)
const verifyConnection = async () => {
    if (!process.env.BREVO_API_KEY) {
        console.log("⚠️ BREVO_API_KEY not set");
        return false;
    }

    console.log("✅ Brevo API configured");
    return true;
};

// 3. Send Email Function
const sendEmail = async (options) => {
    let htmlContent;

    if (options.templateData) {
        htmlContent = generateEmailTemplate(options.templateData);
    } else if (options.message) {
        htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>${options.subject}</h2>
            <p>${options.message.replace(/\n/g, '<br>')}</p>
            <hr>
            <small>Sent from SherLock Admin Dashboard</small>
        </div>`;
    } else {
        throw new Error('Email content missing (provide templateData or message)');
    }

    try {
        console.log(`📨 Attempting to send email to: ${options.email}`);

        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: process.env.FROM_NAME || 'SherLock System',
                    email: process.env.FROM_EMAIL
                },
                to: [{ email: options.email }],
                subject: options.subject,
                htmlContent: htmlContent
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`✅ Email Sent via Brevo. Message ID: ${response.data.messageId}`);

        EmailLog.create({
            recipient: options.email,
            subject: options.subject,
            messageType: options.type || 'notification',
            status: 'sent',
            triggeredBy: options.triggeredBy,
            messageId: response.data.messageId || null,
            error: null
        }).catch(err => console.error('⚠️ Email log save failed:', err.message));

        return { success: true };

    } catch (error) {
        console.error('❌ Brevo Email Send Failed:', error.response?.data || error.message);

        EmailLog.create({
            recipient: options.email,
            subject: options.subject,
            messageType: options.type || 'notification',
            status: 'failed',
            triggeredBy: options.triggeredBy,
            messageId: null,
            error: error.message
        }).catch(err => console.error('⚠️ Email log save failed:', err.message));

        throw error;
    }
};

module.exports = { sendEmail, verifyConnection };
