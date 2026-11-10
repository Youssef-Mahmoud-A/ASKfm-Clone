import { APPLICATION_NAME, FACEBOOK, INSTAGRAM, TWITTER } from "../../../config.js"
import { EmailSubjectEnum } from "../../enum/index.js"

export const templates = {
    [EmailSubjectEnum.CONFIRM_EMAIL]: (data) => {
        return `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Your ${APPLICATION_NAME} verification code</title>
            </head>
            <body style="margin:0; padding:0; background-color:#eef0fb;">
                <!-- Preheader: the preview text shown in the inbox list -->
                <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:#eef0fb;">
                    Your verification code is ${data.code}. It expires in 5 minutes.
                </div>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef0fb;">
                    <tr>
                        <td align="center" style="padding:32px 16px;">

                            <!-- Card -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="max-width:560px; background-color:#ffffff; border-radius:12px;">

                                <!-- Colored header -->
                                <tr>
                                    <td align="center" bgcolor="#3730a3"
                                        style="padding:32px 32px; border-radius:12px 12px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:24px; font-weight:bold; color:#ffffff;">
                                        ${APPLICATION_NAME}
                                    </td>
                                </tr>

                                <!-- Accent stripe -->
                                <tr>
                                    <td height="4" bgcolor="#f59e0b" style="font-size:0; line-height:0;">&nbsp;</td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                    <td style="padding:32px 32px 8px 32px; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:24px; color:#374151;">
                                        <h1 style="margin:0 0 16px 0; font-size:24px; line-height:32px; color:#312e81;">
                                            Welcome, ${data.username}
                                        </h1>
                                        <p style="margin:0 0 8px 0;">
                                            Your account has been created. Enter this code to verify your email address:
                                        </p>
                                    </td>
                                </tr>

                                <!-- Verification code -->
                                <tr>
                                    <td align="center" style="padding:16px 32px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td align="center" bgcolor="#eef0fb"
                                                    style="padding:20px 16px; border:2px dashed #6366f1; border-radius:10px; font-family:'Courier New', Courier, monospace; font-size:36px; font-weight:bold; letter-spacing:10px; color:#3730a3;">
                                                    ${data.code}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:8px 32px 24px 32px; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px; color:#6b7280;">
                                        This code expires in 5 minutes. Never share it with anyone.
                                    </td>
                                </tr>

                                <!-- Social section -->
                                <tr>
                                    <td align="center" style="padding:24px 32px 8px 32px; border-top:1px solid #e5e7eb; font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#374151;">
                                        Follow us
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding:8px 32px 28px 32px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <!-- Twitter -->
                                                <td align="center" bgcolor="#1da1f2" style="border-radius:6px;">
                                                    <a href="${TWITTER}"
                                                        style="display:inline-block; padding:10px 16px; font-family:Arial, Helvetica, sans-serif; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none;">
                                                        Twitter
                                                    </a>
                                                </td>
                                                <td width="8" style="font-size:0; line-height:0;">&nbsp;</td>
                                                <!-- Instagram -->
                                                <td align="center" bgcolor="#e4405f" style="border-radius:6px;">
                                                    <a href="${INSTAGRAM}"
                                                        style="display:inline-block; padding:10px 16px; font-family:Arial, Helvetica, sans-serif; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none;">
                                                        Instagram
                                                    </a>
                                                </td>
                                                <td width="8" style="font-size:0; line-height:0;">&nbsp;</td>
                                                <!-- Facebook -->
                                                <td align="center" bgcolor="#1877f2" style="border-radius:6px;">
                                                    <a href="${FACEBOOK}"
                                                        style="display:inline-block; padding:10px 16px; font-family:Arial, Helvetica, sans-serif; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none;">
                                                        Facebook
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td bgcolor="#f9fafb" style="padding:20px 32px 28px 32px; border-radius:0 0 12px 12px; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:20px; color:#9ca3af;">
                                        You received this email because someone signed up for ASKfm with this address.
                                        If that wasn't you, you can ignore this message.
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>`
    },
    [EmailSubjectEnum.FORGOT_PASSWORD]: (data) => {
        return `< !DOCTYPE html >
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Your ${APPLICATION_NAME} verification code</title>
            </head>
            <body style="margin:0; padding:0; background-color:#eef0fb;">
                <!-- Preheader: the preview text shown in the inbox list -->
                <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:#eef0fb;">
                    Your verification code is ${data.code}. It expires in {{ expiresIn }} minutes.
                </div>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef0fb;">
                    <tr>
                        <td align="center" style="padding:32px 16px;">

                            <!-- Card -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="max-width:560px; background-color:#ffffff; border-radius:12px;">

                                <!-- Colored header -->
                                <tr>
                                    <td align="center" bgcolor="#3730a3"
                                        style="padding:32px 32px; border-radius:12px 12px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:24px; font-weight:bold; color:#ffffff;">
                                        ${APPLICATION_NAME}
                                    </td>
                                </tr>

                                <!-- Accent stripe -->
                                <tr>
                                    <td height="4" bgcolor="#f59e0b" style="font-size:0; line-height:0;">&nbsp;</td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                    <td style="padding:32px 32px 8px 32px; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:24px; color:#374151;">
                                        <h1 style="margin:0 0 16px 0; font-size:24px; line-height:32px; color:#312e81;">
                                            Welcome, ${data.username}
                                        </h1>
                                        <p style="margin:0 0 8px 0;">
                                            Your account has been created. Enter this code to verify your email address:
                                        </p>
                                    </td>
                                </tr>

                                <!-- Verification code -->
                                <tr>
                                    <td align="center" style="padding:16px 32px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td align="center" bgcolor="#eef0fb"
                                                    style="padding:20px 16px; border:2px dashed #6366f1; border-radius:10px; font-family:'Courier New', Courier, monospace; font-size:36px; font-weight:bold; letter-spacing:10px; color:#3730a3;">
                                                    ${data.code}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:8px 32px 24px 32px; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px; color:#6b7280;">
                                        This code expires in 5 minutes. Never share it with anyone.
                                    </td>
                                </tr>

                                <!-- Social section -->
                                <tr>
                                    <td align="center" style="padding:24px 32px 8px 32px; border-top:1px solid #e5e7eb; font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#374151;">
                                        Follow us
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding:8px 32px 28px 32px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <!-- Twitter -->
                                                <td align="center" bgcolor="#1da1f2" style="border-radius:6px;">
                                                    <a href="${TWITTER}"
                                                        style="display:inline-block; padding:10px 16px; font-family:Arial, Helvetica, sans-serif; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none;">
                                                        Twitter
                                                    </a>
                                                </td>
                                                <td width="8" style="font-size:0; line-height:0;">&nbsp;</td>
                                                <!-- Instagram -->
                                                <td align="center" bgcolor="#e4405f" style="border-radius:6px;">
                                                    <a href="${INSTAGRAM}"
                                                        style="display:inline-block; padding:10px 16px; font-family:Arial, Helvetica, sans-serif; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none;">
                                                        Instagram
                                                    </a>
                                                </td>
                                                <td width="8" style="font-size:0; line-height:0;">&nbsp;</td>
                                                <!-- Facebook -->
                                                <td align="center" bgcolor="#1877f2" style="border-radius:6px;">
                                                    <a href="${FACEBOOK}"
                                                        style="display:inline-block; padding:10px 16px; font-family:Arial, Helvetica, sans-serif; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none;">
                                                        Facebook
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td bgcolor="#f9fafb" style="padding:20px 32px 28px 32px; border-radius:0 0 12px 12px; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:20px; color:#9ca3af;">
                                        You received this email because someone signed up for ASKfm with this address.
                                        If that wasn't you, you can ignore this message.
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>`
    },
}
export const verifyEmailTemplate = (data) => {
    return templates[data.subject](data)
}

