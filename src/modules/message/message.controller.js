import { Router } from "express";
import { fileValidation, localFileUpload, successResponse } from "../../common/utils/index.js";
import { createMessage, deleteMessage, getAllMessages, getMessage } from "./message.service.js";
import { authentication, uploadMiddleware, validation } from "../../middleware/index.js";
import * as validators from './message.validation.js'
import { decodeToken } from "../../common/security/index.js";


const router = Router();

const messageFolderName = "messages";

router.post("/",
    async (req, res, next) => {
        if (req.headers['authorization']) {
            const { user, payload } = await decodeToken({ authorization: req.headers.authorization })
            req.user = user;
            req.payload = payload;
        }
        next();
    },
    uploadMiddleware({
        multerMiddleware: localFileUpload().any("attachments", 3),
        validation: fileValidation.image,
        customPath: messageFolderName,
        isRequired: false
    }),
    validation(validators.createMessage),
    async (req, res, next) => {
        const data = await createMessage(req.body, req.files, req.user)
        return successResponse({ res, status: 201, data })
    });

router.get("/", authentication(), validation(validators.allMessages),
    async (req, res, next) => {
        const data = await getAllMessages(req.validate.query, req.user)
        return successResponse({ res, data })
    });

router.get("/:messageId", authentication(), validation(validators.getMessage),
    async (req, res, next) => {
        const data = await getMessage(req.validate.params, req.user)
        return successResponse({ res, data })
    });

router.delete("/:messageId", authentication(), validation(validators.deleteMessage),
    async (req, res, next) => {
        const data = await deleteMessage(req.validate.params, req.user)
        return successResponse({ res, data })
    });

export default router;