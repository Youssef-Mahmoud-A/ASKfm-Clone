

export const ApplicationException = ({
    message = "error",
    options = {
        cause: { status: 400 }
    }
} = {}) => {
    throw new Error(message, options)
}

export const ConflictException = (message = "Conflict", issues = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 409, issues }
        }
    })
}

export const TooManyRequestException = (message = "Too Many Request Exception", issues = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 429, issues }
        }
    })
}

export const NotFoundException = (message = "NotFound", issues = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 404, issues }
        }
    })
}

export const UnauthorizedException = (message = "Unauthorized", issues = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 401, issues }
        }
    })
}

export const ForbiddenException = (message = "Forbidden", issues = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 403, issues }
        }
    })
}

export const BadRequestException = (message = "Bad Request", issues = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 400, issues }
        }
    })
}