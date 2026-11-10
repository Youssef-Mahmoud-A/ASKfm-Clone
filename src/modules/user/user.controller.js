import { Router } from "express";
import { fileValidation, localFileUpload, successResponse } from "../../common/utils/index.js";
import { logout, profile, rotateToken, update } from "./user.service.js";
import { authentication, authorization, uploadMiddleware } from "../../middleware/index.js";
import { RoleEnum, TokenTypeEnum } from "../../common/enum/index.js";


const router = Router();

router.patch("/profile-image", authentication(), uploadMiddleware({
    multerMiddleware: localFileUpload({ maxFileSize: 5 }).single("attachment"),
    customPath: "users", validation: fileValidation.image
}), async (req, res, next) => {
    return successResponse({ res, data: { file: req.file ?? req.files } })
});

router.get("/", authentication(), async (req, res, next) => {
    const data = await profile(req.user)
    return successResponse({ res, data })
});

router.patch("/", authentication(), authorization(RoleEnum.ADMIN), async (req, res, next) => {
    const data = await update(req.user, req.body)
    return successResponse({ res, data })
});

router.post("/rotate-token", authentication(TokenTypeEnum.REFRESH), async (req, res, next) => {
    const data = await rotateToken(req.payload, req.user)
    return successResponse({ res, data })
});

router.post("/logout", authentication(), async (req, res, next) => {
    const data = await logout(req.payload, req.user, req.body)
    return successResponse({ res, data })
});


export default router;