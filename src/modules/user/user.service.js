import { logoutEnum } from '../../common/enum/index.js';
import { ConflictException } from '../../common/exceptions/error.exceptions.js';
import { findByIdAndUpdate } from '../../common/repository/index.js';
import { createLoginCredentials, createRevokeToken, userBaseRevokeTokenKey } from '../../common/security/index.js';
import { del, keys } from '../../common/services/index.js';
import { ACCESS_TOKEN_EXPIRES_IN } from '../../config.js';
import { UserModel } from '../../DB/Model/user.model.js';

export const profile = async (account) => {
    return account
}


export const update = async (user, data) => {

    const account = await findByIdAndUpdate({
        model: UserModel,
        id: user._id,
        update: data
    })
    return account

}

export const rotateToken = async (payload, user) => {
    const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
    const currentTime = Date.now() + (5 * 60000)
    if (currentTime < accessExpiresIn) {
        throw ConflictException("Can't create new login credentials before access token expires")
    }
    const data = await createLoginCredentials({ user })
    await createRevokeToken({ payload })
    return data
}

export const logout = async (payload, user, { action = logoutEnum.DEVICE }) => {
    switch (action) {
        case logoutEnum.ALL:
            user.changeCredentialsTime = new Date()
            await user.save()
            await del({ key: await keys({ prefix: userBaseRevokeTokenKey({ userId: payload.sub }) }) })
            break;
        default:
            await createRevokeToken({ payload });
            break;
    }
}