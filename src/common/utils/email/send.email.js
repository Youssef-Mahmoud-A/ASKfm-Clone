import nodemailer from 'nodemailer';
import { APP_EMAIL, APP_PASSWORD, APPLICATION_NAME } from '../../../config.js';

export const UserEmailKey = ({ email, subject }) => {
    return `User::${email}::${subject}::OTP`
}

export const UserEmailTrialsKey = ({ email, subject }) => {
    return `${UserEmailKey({ email, subject })}::TRIALS`
}

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD,
    },
});

export const sendEmail = async ({
    to, // list of recipients
    cc,
    bcc,
    username,
    subject, // subject line
    text, // plain text body
    html, // HTML body
    attachments = []
}) => {
    try {
        const info = await transporter.sendMail({
            from: `"${APPLICATION_NAME}" <${APP_EMAIL}>`, // sender address
            to, // list of recipients
            cc,
            bcc,
            username,
            subject, // subject line
            text, // plain text body
            html, // HTML body
            attachments
        });
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}