import multer from 'multer';
import { randomUUID } from 'crypto'
import { resolve } from 'node:path';
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { fileTypeFromBuffer } from 'file-type'
import { BadRequestException } from '../../exceptions/error.exceptions.js';



export const fileValidation = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    files: ['application/pdf', 'application/json']
}

//Saving file to memory
export const localFileUpload = ({ maxFileSize = 5 } = {}) => {
    const storage = multer.memoryStorage()
    return multer({ storage, limits: { fileSize: maxFileSize * 1024 * 1024 } })
}

export const processFile = async ({ customPath = "general", file, validation = [] }) => {
    const result = await fileTypeFromBuffer(file.buffer)
    if (!result || !validation.includes(result.mime)) {
        throw BadRequestException("Your file had an invalid format!")
    } else {
        await mkdir(resolve(`./assets/${customPath}`), { recursive: true })
        const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`
        await writeFile(resolve(`./${uniqueFilePath}`), file.buffer)
        file.path = uniqueFilePath
        return file
    }
}

export const processFiles = async ({ customPath, files = [], validation = [] }) => {
    const assets = []
    for (const file of files) {
        const result = await fileTypeFromBuffer(file.buffer)
        if (!validation.includes(result.mime)) {
            for (let x = 0; x < assets.length; x++) {
                const removed = assets[x]
                await unlink(removed.path)
            }
            throw BadRequestException("One of the files had an invalid format!!")
        }
        const upoladFile = await processFile({ customPath, file, validation })
        assets.push(upoladFile)
    }
    return assets
}

export const processFields = async ({ customPath, fields = {}, validation = [] }) => {
    const assets = []
    for (const field of Object.keys(fields)) {
        const files = await processFiles({ customPath, files: fields[field], validation })
        assets.push({ field, files })
    }
    return assets
}

export const processMulterUpload = async ({ customPath, validation = [], req }) => {
    if (req.file) {
        await processFile({ customPath, file: req.file, validation })
    } else if (Array.isArray(req.files)) {
        await processFiles({ customPath, files: req.files, validation })
    } else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
        await processFields({ customPath, fields: req.files, validation })
    }
}


//Saving file to disk
// export const localFileUpload = ({ maxFileSize = 5, validation = [] } = {}) => {
//     const storage = multer.diskStorage({
//         destination: function (req, file, cb) {
//             cb(null, './assets')
//         }, filename: function (req, file, cb) {
//             console.log({ file });
//             cb(null, randomUUID() + file.originalname)
//         }
//     })
//     function fileFilter(req, file, cb) {
//         if (validation.includes(file.mimetype)) {
//             cb(null, true)
//         } else {
//             cb(new Error("Invalid file format to upload!!", { cause: { status: 400 } }), false)
//         }
//     }
//     return multer({ fileFilter, storage, limits: { fileSize: maxFileSize * 1024 * 1024 } })
// }

// export const processFile = ({ validation = [] }) => {
//     return async (req, res, next) => {
//         const filePath = resolve(`./${req.file.path}`)
//         const fileBuffer = await readFile(filePath)
//         const result = await fileTypeFromBuffer(fileBuffer)

//         if (!result || !validation.includes(result.mime)) {
//             await unlink(filePath)
//             next(new Error("Your file had an invalid format!", { cause: { status: 400 } }))
//         }
//         next()
//     }
// }