import { EventEmitter } from 'node:events'
import { sendEmail } from './index.js';
import { verifyEmailTemplate } from './index.js';

export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async ({ recipients, subject, data}) => {
    try {
        await sendEmail({
            ...recipients,
            subject,
            html: verifyEmailTemplate({ code: data.code, subject, title: data.title ?? subject, username: data.username })
        })
    } catch (error) {
        console.log(error);
    }
})