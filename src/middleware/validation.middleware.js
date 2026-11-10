import { LanguageEnum } from "../common/enum/security.enum.js";
import { BadRequestException } from "../common/exceptions/error.exceptions.js";


export const validation = (schema) => {
    return (req, res, next) => {
        const lang = Number(req.headers['accept-language'] ?? LanguageEnum.EN);
        const validationResult = schema(lang).safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
            file: req.file,
            files: req.files
        })
        if (!validationResult.success) {
            throw BadRequestException("Validation Error", validationResult.error.issues);
        }
        req.validate = validationResult.data
        next()
    }
}