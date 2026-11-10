import crypto from 'node:crypto'

export const createOtp = () => {
    return crypto.randomInt(100000, 1000000);
    // return code.toString()
}