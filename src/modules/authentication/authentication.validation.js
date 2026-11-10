import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";

export const loginSchema = (lang) => {
    return z.strictObject({
        email: generalValidationFields.email(lang),
        password: generalValidationFields.password(lang)
    })
}

export const login = (lang) => {
    return z.object({
        body: loginSchema(lang)
    })
}

export const signup = (lang) => {
    return z.object({
        body: loginSchema(lang).safeExtend({
            username: generalValidationFields.username(lang),
            phone: generalValidationFields.phone(lang),
            confirmPassword: generalValidationFields.password(lang)
        }).superRefine((data, ctx) => {
            generalValidationFields.matchFields({ original: "password", copy: "confirmPassword", data, ctx, lang })


            if (!data.username.includes(" ")) {
                ctx.addIssue({
                    code: "custom",
                    path: ['username'],
                    message: "username must contain 2 parts"
                })
            }
        })
    })
}

export const confirmEmail = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang)
        })
    })
}

export const resendConfirmEmail = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang)
        })
    })
}

export const forgotPasswordRequest = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang)
        })
    })
}

export const confirmForgotPassword = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang)
        })
    })
}

export const resetPassword = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang),
            password: generalValidationFields.password(lang),
            confirmPassword: generalValidationFields.password(lang)
        }).superRefine((data, ctx) => {
            generalValidationFields.matchFields({ original: "password", copy: "confirmPassword", data, ctx, lang })
        })
    })
}