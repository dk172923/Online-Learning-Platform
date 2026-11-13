// utils/email.js - transactional email via Resend (https://resend.com)
// Keeps a nodemailer-style `sendMail({ to, subject, html, text, replyTo })` API.
const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Sender must be on a domain verified in Resend. For testing, Resend's
// "onboarding@resend.dev" works but can ONLY deliver to your own Resend account email.
const FROM = process.env.EMAIL_FROM || 'LearnHub <onboarding@resend.dev>';

const transporter = {
    async sendMail({ to, subject, html, text, replyTo }) {
        const { data, error } = await resend.emails.send({
            from: FROM,
            to,
            subject,
            html,
            text,
            replyTo,
        });
        if (error) throw new Error(`Resend: ${error.message}`);
        return data;
    },
};

module.exports = transporter;
