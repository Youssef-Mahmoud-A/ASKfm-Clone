import { z } from 'zod';
import { GenderEnum, LanguageEnum } from './enum/index.js';
import mongoose from 'mongoose';

const validationMessage = {
    102: {
        ar: "عفوا لا يمكن قبول اسم مستخدم اقل من حرفين",
        en: "MINIMUM USERNAME LENGTH IS 2 CHAR"
    }
}

const getValidationMessage = (lang, code) => {
    return lang == LanguageEnum.EN ? validationMessage[code].en : validationMessage[code].ar
}

const matchFields = ({ original = "password", copy, data, ctx, lang }) => {
    if (data[original] != data[copy]) {
        ctx.addIssue({
            code: "custom",
            path: [copy],
            message: lang == LanguageEnum.EN ? `${original} doesn't match ${copy}` : `${original} لا يتطابق مع ${copy}`
        })
    }
}

export const generalValidationFields = {
    email: (lang) => z.email({ message: "INVALID EMAIL FORMAT" }),
    otp: (lang) => z.string().regex(/^\d{6}$/),
    password: (lang) => z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_]).{8,16}$/).min(8).max(16),
    username: (lang) => z.string().min(2, { message: getValidationMessage(lang, 102) }).max(51),
    phone: (lang) => z.e164(),
    gender: (lang) => z.enum(GenderEnum),
    id: (lang) => z.string().refine((data) => { return mongoose.Types.ObjectId.isValid(data) }, { message: "invalid ID format!!" }),
    file: (lang) => z.strictObject({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        buffer: z.instanceof(Buffer),
        size: z.number(),
        path: z.string(),
    }),
    matchFields
}