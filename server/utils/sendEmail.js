const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
    // If no API key, log to console (Dev mode)
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'SG.placeholder') {
        console.log(`[DEV MODE] Email to ${options.email}: ${options.message}`);
        return;
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: options.email,
        from: process.env.EMAIL_FROM || 'noreply@outfitinspo.com',
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // Dev Helper: Always log the email content so we can see the OTP if email fails
    console.log('----------------------------------------------------');
    console.log(`[EMAIL DEBUG] To: ${options.email}`);
    console.log(`[EMAIL DEBUG] Subject: ${options.subject}`);
    console.log(`[EMAIL DEBUG] Message: ${options.message}`);
    console.log('----------------------------------------------------');

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid');
    } catch (error) {
        console.error('SendGrid Error:', error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
};

module.exports = sendEmail;
