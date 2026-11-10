import { BadRequestException } from "../common/exceptions/error.exceptions.js";
import { processMulterUpload } from "../common/utils/index.js";


export const uploadMiddleware = ({ isRequired = true, multerMiddleware, customPath, validation = [] }) => {
    return (req, res, next) => {
        multerMiddleware(req, res, async (error) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }))
                return;
            }
            try {
                if (isRequired && (!req.file && !req.files)) {
                    next(BadRequestException("File cannot be empty!!!"))
                    return;
                }
                await processMulterUpload({ customPath, validation, req })
                next()
            } catch (error) {
                next(new Error(error.message, { cause: { status: 400 } }))
            }
        })

    }
}
