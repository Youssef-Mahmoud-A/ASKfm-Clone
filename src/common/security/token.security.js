import jwt from 'jsonwebtoken'
import {
    ACCESS_ADMIN_TOKEN_SIGNATURE, ACCESS_TOKEN_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE,
    REFRESH_TOKEN_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNATURE
} from '../../config.js';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../exceptions/index.js';
import { findById } from '../repository/index.js';
import { UserModel } from '../../DB/Model/index.js';
import { RoleEnum, TokenTypeEnum } from '../enum/index.js';
import { randomUUID } from 'node:crypto'
import { exist, set } from '../services/index.js';


export const userBaseKey = ({ userId }) => {
    return `User::${userId.toString()}`
}

export const userBaseRevokeTokenKey = ({ userId }) => {
    return `${userBaseKey({ userId })}::Revoke_Token`
}

export const userRevokeTokenKey = ({ userId, jti }) => {
    return `${userBaseRevokeTokenKey({ userId })}::${jti}`
}

export const createToken = async ({
    payload = {},
    options = {},
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.sign(payload, secret, options)
}


export const verifyToken = async ({
    token = "",
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.verify(token, secret)
}

const getTokenSignatures = async ({ role = RoleEnum.USER } = {}) => {
    let signatures;

    switch (role) {
        case RoleEnum.ADMIN:
            signatures = { accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE }
            break;

        default:
            signatures = { accessSignature: ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: REFRESH_USER_TOKEN_SIGNATURE }
            break;
    }
    return signatures
}

const getSignature = async ({ tokenType = TokenTypeEnum.ACCESS, role = RoleEnum.USER } = {}) => {
    const signatures = await getTokenSignatures({ role })
    return tokenType == TokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature
}


export const decodeToken = async ({
    authorization = "",
    tokenType = TokenTypeEnum.ACCESS

} = {}) => {

    const decoded = jwt.decode(authorization);
    if (!decoded?.aud?.length) {
        throw BadRequestException("Missing token payload")
    }


    const payload = await verifyToken({
        token: authorization,
        secret: await getSignature({ tokenType, role: decoded.aud[0] })
    })

    if (!payload?.sub) {
        throw BadRequestException("Missing token payload")
    }

    if (await exist({ key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }) })) {
        throw UnauthorizedException("Expired login credentials")
    }
    const user = await findById({
        model: UserModel,
        id: payload.sub
    })
    if (!user) {
        throw NotFoundException("Invalid user")
    }
    if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
        throw UnauthorizedException("Invalid login credentials")
    }

    return { user, payload }
}

export const createLoginCredentials = async ({
    user,
    options = {}
}) => {
    const { accessSignature, refreshSignature } = await getTokenSignatures({ role: user.role })
    const jwtid = randomUUID()
    const access_token = await createToken({
        payload: { sub: user._id },
        secret: accessSignature,
        options: {
            ...options,
            audience: [user.role],
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            jwtid
        }
    })

    const refresh_token = await createToken({
        payload: { sub: user._id },
        secret: refreshSignature,
        options: {
            ...options,
            audience: [user.role],
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
            jwtid
        }
    })
    return { access_token, refresh_token }
}

export const createRevokeToken = async ({ payload }) => {
    const consumedTime = (Math.ceil((Date.now() / 1000) - payload.iat))
    const refreshExpiresIn = payload.iat + REFRESH_TOKEN_EXPIRES_IN
    const ttl = refreshExpiresIn - consumedTime
    await set({ key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }), value: payload.jti, ttl })
    return
}