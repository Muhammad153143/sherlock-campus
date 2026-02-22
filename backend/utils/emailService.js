const axios = require('axios');
const EmailLog = require('../models/EmailLog');

// HTML Template
const generateEmailTemplate = (data) => {
    const { title, name, details, actionUrl, actionText } = data;

    return `
    <div style="font-family: Arial; padding:20px;">
        <h2>Hello ${name || 'Student'},</h2>
        <p>${title}</p>
        <ul>
            ${Object.entries(details || {}).map(([key, value]) =>
                `<li><strong>${key}:</strong> ${value}</li>`
            ).join('')}
        </ul>
        ${actionUrl ? `<a href="${actionUrl}" style="background:#27ae60;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">${actionText || 'View Details'}</a>` : ''}
        <hr>
        <small>© ${new Date().getFullYear()} SherLock System</small>
    </div>
    `;
};

// No SMTP verify needed anymore
const verifyConnection = async () => {
    if (!process.env.BREVO_API_KEY) {
        console.error('❌ Missing BREVO_API_KEY');
        return false;
    }
    console.log('✅ Brevo API Ready');
    return true;
};

const sendEmail = async (options) => {

    const htmlContent = options.templateData
        ? generateEmailTemplate(options.templateData)
        : `<div><h2>${options.subject}</h2><p>${options.message}</p></div>`;

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: process.env.FROM_NAME,
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

        console.log('✅ Email Sent:', response.data.messageId);

        EmailLog.create({
            recipient: options.email,
            subject: options.subject,
            messageType: options.type || 'notification',
            status: 'sent',
            triggeredBy: options.triggeredBy,
            messageId: response.data.messageId,
            error: null
        }).catch(() => {});

        return { success: true };

    } catch (error) {
        console.error('❌ Email Send Failed:', error.response?.data || error.message);

        EmailLog.create({
            recipient: options.email,
            subject: options.subject,
            messageType: options.type || 'notification',
            status: 'failed',
            triggeredBy: options.triggeredBy,
            messageId: null,
            error: error.message
        }).catch(() => {});

        throw error;
const axios = require('axios');
const EmailLog = require('../models/EmailLog');

// HTML Template
const generateEmailTemplate = (data) => {
    const { title, name, details, actionUrl, actionText } = data;

    return `
    <div style="font-family: Arial; padding:20px;">
        <h2>Hello ${name || 'Student'},</h2>
        <p>${title}</p>
        <ul>
            ${Object.entries(details || {}).map(([key, value]) =>
                `<li><strong>${key}:</strong> ${value}</li>`
            ).join('')}
        </ul>
        ${actionUrl ? `<a href="${actionUrl}" style="background:#27ae60;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">${actionText || 'View Details'}</a>` : ''}
        <hr>
        <small>© ${new Date().getFullYear()} SherLock System</small>
    </div>
    `;
};

// No SMTP verify needed anymore
const verifyConnection = async () => {
    if (!process.env.BREVO_API_KEY) {
        console.error('❌ Missing BREVO_API_KEY');
        return false;
    }
    console.log('✅ Brevo API Ready');
    return true;
};

const sendEmail = async (options) => {

    const htmlContent = options.templateData
        ? generateEmailTemplate(options.templateData)
        : `<div><h2>${options.subject}</h2><p>${options.message}</p></div>`;

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: process.env.FROM_NAME,
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

        console.log('✅ Email Sent:', response.data.messageId);

        EmailLog.create({
            recipient: options.email,
            subject: options.subject,
            messageType: options.type || 'notification',
            status: 'sent',
            triggeredBy: options.triggeredBy,
            messageId: response.data.messageId,
            error: null
        }).catch(() => {});

        return { success: true };

    } catch (error) {
        console.error('❌ Email Send Failed:', error.response?.data || error.message);

        EmailLog.create({
            recipient: options.email,
            subject: options.subject,
            messageType: options.type || 'notification',
            status: 'failed',
            triggeredBy: options.triggeredBy,
            messageId: null,
            error: error.message
        }).catch(() => {});

        throw error;
    }
};

module.exports = { sendEmail, verifyConnection };
