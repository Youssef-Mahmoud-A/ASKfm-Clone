import bcrypt from 'bcrypt'
import { SALT } from '../../config.js'

export const hash = async (plaintext, salt_round = SALT, minor = "b") => {
    const saltSignature = await bcrypt.genSalt(salt_round, minor);
    const cipherText = await bcrypt.hash(plaintext, saltSignature);
    return cipherText;
}

export const compare = async (plaintext, cipherText) => {
    const match = await bcrypt.compare(plaintext, cipherText);
    return match
}