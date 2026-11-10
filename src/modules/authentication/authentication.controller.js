import { Router } from "express";
import { confirmEmail, confirmForgotPassword, forgotPasswordRequest, login, resendConfirmEmail, resetPassword, signup, signupWithGmail } from "./authentication.service.js";
import { generateLimiter, successResponse } from "../../common/utils/index.js";
import * as validators from './authentication.validation.js'
import { validation } from "../../middleware/index.js";
import { del } from "../../common/services/cache.service.js";

const router = Router();

router.post("/signup", validation(validators.signup), async (req, res, next) => {
    const data = await signup(req.body);
    return successResponse({ res, status: 201, data })
})

router.post("/forgot-password-request", validation(validators.forgotPasswordRequest), async (req, res, next) => {
    const data = await forgotPasswordRequest(req.body);
    return successResponse({ res, status: 201, data })
})

router.post("/confirm-forgot-password", validation(validators.confirmForgotPassword), async (req, res, next) => {
    const data = await confirmForgotPassword(req.body);
    return successResponse({ res, status: 200, data })
})

router.patch("/reset-password", validation(validators.resetPassword), async (req, res, next) => {
    const data = await resetPassword(req.body);
    return successResponse({ res, status: 200, data })
})

router.patch("/confirm-email", validation(validators.confirmEmail), async (req, res, next) => {
    const data = await confirmEmail(req.body);
    return successResponse({ res, status: 200, data })
})

router.patch("/resend-confirm-email", validation(validators.resendConfirmEmail), async (req, res, next) => {
    const data = await resendConfirmEmail(req.body);
    return successResponse({ res, status: 200, data })
})

router.post("/signup-with-gmail", async (req, res, next) => {
    const { status, data } = await signupWithGmail(req.body);
    return successResponse({ res, status, data })
})

const loginLimiter = generateLimiter({ limit: 5, ttl: 5, skipSuccessfulRequests: true })
router.post("/login", loginLimiter, validation(validators.login), async (req, res, next) => {

    const data = await login(req.validate.body);
    await del({ key: req.rateLimit.key })
    return successResponse({ res, data })
})

export default router