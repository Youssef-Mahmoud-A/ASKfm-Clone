import { FAILOVER_MODES } from "redis";
import { EmailSubjectEnum, ProviderEnum } from "../../common/enum/index.js";
import { BadRequestException, ConflictException, NotFoundException, TooManyRequestException } from "../../common/exceptions/index.js";
import { createOne, findOne } from "../../common/repository/index.js";
import { compare, createLoginCredentials, encryption, hash, userBaseRevokeTokenKey } from "../../common/security/index.js";
import { del, expire, get, incrBy, keys, set, ttl } from "../../common/services/cache.service.js";
import { createOtp, emailEvent, sendEmail, UserEmailKey, UserEmailTrialsKey } from "../../common/utils/index.js";
import { WEB_CLIENT_IDS } from "../../config.js";
import { UserModel } from "../../DB/Model/user.model.js"
import { OAuth2Client } from 'google-auth-library';

/*{
  payload: {
    iss: 'https://accounts.google.com',
    azp: '855311478091-rhbspspaljgi46e856ugmp8di29d46nj.apps.googleusercontent.com',
    aud: '855311478091-rhbspspaljgi46e856ugmp8di29d46nj.apps.googleusercontent.com',
    sub: '105874053491974057533',
    email: 'youssef.mahmoud3002@gmail.com',
    email_verified: true,
    nonce: 'not_provided',
    nbf: 1792549162,
    name: 'Youssef',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocLU4vnHFOJ3cx2sm_9VJ3CRdsu6ih3veW_8KqBAxb4AyQqn7fI=s96-c',
    given_name: 'Youssef',
    iat: 1792549462,
    exp: 1792553062,
    jti: '947f512af2aeeef46077f7297a9be8b51be79085'
  }
*/

const client = new OAuth2Client();


async function verifyGoogleAccount(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: WEB_CLIENT_IDS,
    });
    const payload = ticket.getPayload();
    if (!payload.email_verified) {
        throw BadRequestException("Email is not verified!")
    }
    return payload;
}

export const signupWithGmail = async ({ idToken }) => {
    const { name, email, picture } = await verifyGoogleAccount(idToken);
    const existAccount = await findOne({
        model: UserModel,
        filter: { email }
    })
    if (existAccount) {
        if (existAccount.provider != ProviderEnum.GOOGLE) {
            throw ConflictException("Invalid account provider")
        }
        return { status: 200, data: await createLoginCredentials({ user: existAccount }) };
    }
    const user = await createOne({
        model: UserModel,
        data: {
            username: name,
            email,
            confirmEmail: new Date(),
            provider: ProviderEnum.GOOGLE,
            image: picture
        }
    })
    return { status: 201, data: await createLoginCredentials({ user }) };
}

export const login = async ({ email, password }) => {

    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } }
    });

    if (!account) {
        throw NotFoundException("Account doesn't exist! OR Email is not confirmed!")
    };

    const match = await compare(password, account.password)

    if (!match) throw NotFoundException("Password doesn't match!")

    return await createLoginCredentials({ user: account })
}


const sendEmailOtp = async ({ email, subject, data, expiresIn = 300, maxTrials = 3, blockInSeconds = 600 }) => {
    const existOTP_ttl = await ttl({ key: UserEmailKey({ email, subject }) })
    if (existOTP_ttl > 0) {
        throw ConflictException(`OTP is still valid. Please try again in ${existOTP_ttl} seconds!`)
    }
    const oldTrials = await get({ key: UserEmailTrialsKey({ email, subject }) }) ?? 0
    if (oldTrials >= maxTrials) {
        throw TooManyRequestException("Max OTP trials has been reached!")
    }
    const otp = createOtp()
    await set({
        key: UserEmailKey({ email, subject }),
        value: await hash(otp.toString()),
        ttl: expiresIn
    })
    const currentTrials = await incrBy({ key: UserEmailTrialsKey({ email, subject }), value: 1 });
    if (currentTrials == 3) {
        await expire({ key: UserEmailTrialsKey({ email, subject }), ttl: blockInSeconds })
    }
    emailEvent.emit("sendEmail", { recipients: { to: email }, subject, data: { code: otp, username: data.username } })
}

export const signup = async ({ username, email, password, phone }) => {
    const duplicatedAccount = await findOne({
        model: UserModel,
        filter: { email }
    });

    if (duplicatedAccount) throw ConflictException("Email exists!");

    const account = await createOne({
        model: UserModel,
        data: {
            username, email, password: await hash(password), phone: await encryption(phone)
        }
    });
    await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL, data: { username } })
    return account;
}

export const confirmEmail = async ({ otp, email }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } }
    });

    if (!account) throw NotFoundException("Account doesn't exist! OR Email already confirmed");
    const hashOtp = await get({ key: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) })
    if (!hashOtp || ! await compare(otp, hashOtp)) {
        throw ConflictException("Invalid OTP")
    }

    account.confirmEmail = new Date();
    await account.save();
    // await del({ key: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) })
    await del({ key: await keys({ prefix: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) }) })
}

export const resendConfirmEmail = async ({ email }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } }
    });

    if (!account) throw NotFoundException("Account doesn't exist! OR Email already confirmed");
    await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL, data: { username: account.username } })
    return
}

export const forgotPasswordRequest = async ({ email }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } }
    });

    if (!account) throw NotFoundException("Unable to send forget password request!");
    await sendEmailOtp({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD, data: { username: account.username } })
    return
}

export const confirmForgotPassword = async ({ otp, email }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } }
    });

    if (!account) throw NotFoundException("Account doesn't exist! OR Email already confirmed");
    const hashOtp = await get({ key: UserEmailKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD }) })
    if (!hashOtp || ! await compare(otp, hashOtp)) {
        throw ConflictException("Invalid OTP for resseting password")
    }
    return account;
}

export const resetPassword = async ({ otp, email, password }) => {
    const account = await confirmForgotPassword({ otp, email })
    account.password = await hash(password);
    account.changeCredentialsTime = new Date();
    await account.save();

    const result = await Promise.all([
        keys({ prefix: userBaseRevokeTokenKey({ userId: account._id }) }),
        keys({ prefix: UserEmailKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD }) })
    ])
    
    await del({ key: [...result[0], ...result[1]] })
    return;
}

