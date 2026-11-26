# ASKfm Clone -- Backend API

A RESTful backend inspired by ASKfm, built with **Node.js, Express,
MongoDB, and Redis**. It provides authentication, user profile
management, and question/message functionality, including optional
anonymous submissions and image attachments.

> This repository contains the backend API, not a frontend application.

## Features

### Authentication and account management

-   Email/password registration and login.
-   Email confirmation using one-time passwords (OTPs).
-   Google sign-in using Google ID token verification.
-   Forgot-password and password-reset flows.
-   JWT access and refresh tokens.
-   Token revocation and refresh-token rotation.
-   Logout from the current device or all sessions.

### Questions and messages

-   Send messages to registered users.
-   Optional authentication when submitting a message, allowing
    anonymous submissions.
-   Attach up to three images to a message.
-   Retrieve received, sent, or combined message lists with pagination.
-   Retrieve a received message by ID.
-   Delete a received message.

### User profiles

-   Retrieve the authenticated user's profile.
-   Upload a profile image.
-   Admin-authorized user update endpoint.

### Infrastructure and security

-   MongoDB persistence through Mongoose.
-   Redis for OTP storage, caching, token revocation, and rate limiting.
-   Request validation with Zod.
-   Password hashing with bcrypt.
-   JWT authentication and role authorization.
-   Helmet security headers and request logging with Morgan.
-   Rate limiting, including a login-specific limiter.
-   File-type validation based on file contents.

## Tech stack

-   **Runtime:** Node.js (the package configuration specifies `26.13.0`)
-   **Web framework:** Express 5
-   **Database:** MongoDB / Mongoose
-   **Cache and temporary state:** Redis
-   **Authentication:** JSON Web Tokens, Google OAuth token
    verification, bcrypt
-   **Validation:** Zod
-   **File uploads:** Multer, `file-type`
-   **Email:** Nodemailer
-   **Security and middleware:** Helmet, `express-rate-limit`, Morgan

## Getting started

### Prerequisites

-   Node.js `26.13.0` (or a compatible version)
-   MongoDB
-   Redis
-   SMTP credentials for account-confirmation and password-reset emails
-   Google OAuth Web Client ID(s), if using Google sign-in

### Installation

``` bash
git clone https://github.com/Youssef-Mahmoud-A/ASKfm-Clone.git
cd ASKfm-Clone
npm install
```

### Environment variables

The application loads `.env.development` or `.env.production` according
to `NODE_ENV`.

Create the appropriate environment file in the project root. The
configuration reads these variables:

``` env
PORT=9000

DB_URI=mongodb://127.0.0.1:27017/askfm
REDIS_URI=redis://127.0.0.1:6379

APP_EMAIL=your-email@example.com
APP_PASSWORD=your-email-app-password
APPLICATION_NAME=ASKfm Clone

SALT=12
IV_LENGTH=16
ENC_KEY=replace-with-a-secure-encryption-key

ACCESS_ADMIN_TOKEN_SIGNATURE=replace-with-a-secure-secret
REFRESH_ADMIN_TOKEN_SIGNATURE=replace-with-a-secure-secret
ACCESS_USER_TOKEN_SIGNATURE=replace-with-a-secure-secret
REFRESH_USER_TOKEN_SIGNATURE=replace-with-a-secure-secret

ACCESS_TOKEN_EXPIRES_IN=1800
REFRESH_TOKEN_EXPIRES_IN=31536000

WEB_CLIENT_IDS=your-google-web-client-id
ORIGINS=http://localhost:3000

TWITTER=
FACEBOOK=
INSTAGRAM=
```

Use strong, unique secrets in real deployments. Keep environment files
out of version control and never commit real credentials. Multiple
Google client IDs and allowed origins can be provided as comma-separated
values.

### Run the API

Development mode:

``` bash
npm run start:dev
```

Production script:

``` bash
npm run start:prod
```

The API uses port `9000` by default unless `PORT` is set. The production
script starts the application through PM2 in cluster mode. For
production, configure your process manager and reverse proxy (such as
Nginx) for your server environment.

## API overview

The examples below assume the API is running at:

``` text
http://localhost:9000
```

### Base route

  Method   Endpoint   Description
  -------- ---------- ----------------------
  `GET`    `/`        API welcome response

### Authentication -- `/auth`

  ---------------------------------------------------------------------------------
  Method                  Endpoint                          Description
  ----------------------- --------------------------------- -----------------------
  `POST`                  `/auth/signup`                    Register with email and
                                                            password

  `POST`                  `/auth/login`                     Log in with email and
                                                            password

  `POST`                  `/auth/signup-with-gmail`         Sign up or log in using
                                                            a Google ID token

  `PATCH`                 `/auth/confirm-email`             Confirm an email
                                                            address using an OTP

  `PATCH`                 `/auth/resend-confirm-email`      Request another
                                                            email-confirmation OTP

  `POST`                  `/auth/forgot-password-request`   Request a
                                                            password-reset OTP

  `POST`                  `/auth/confirm-forgot-password`   Verify the
                                                            password-reset OTP

  `PATCH`                 `/auth/reset-password`            Set a new password
  ---------------------------------------------------------------------------------

### Users -- `/user`

  -----------------------------------------------------------------------------
  Method            Endpoint                Description       Access
  ----------------- ----------------------- ----------------- -----------------
  `GET`             `/user/`                Get the current   Authenticated
                                            user's profile    

  `PATCH`           `/user/profile-image`   Upload a profile  Authenticated
                                            image             

  `PATCH`           `/user/`                Update a user     Admin

  `POST`            `/user/rotate-token`    Rotate            Refresh token
                                            access/refresh    
                                            credentials       

  `POST`            `/user/logout`          Log out from a    Authenticated
                                            device or all     
                                            sessions          
  -----------------------------------------------------------------------------

### Messages -- `/message`

  -----------------------------------------------------------------------------
  Method            Endpoint                Description       Access
  ----------------- ----------------------- ----------------- -----------------
  `POST`            `/message/`             Send a message;   Public / optional
                                            authentication is auth
                                            optional          

  `GET`             `/message/`             Get a paginated   Authenticated
                                            message list      

  `GET`             `/message/:messageId`   Get a received    Authenticated
                                            message by ID     recipient

  `DELETE`          `/message/:messageId`   Delete a received Authenticated
                                            message by ID     recipient
  -----------------------------------------------------------------------------

The message-list endpoint accepts these query parameters:

  Parameter   Values          Description
  ----------- --------------- ------------------------------------
  `type`      `0`, `1`, `2`   `0`: received, `1`: sent, `2`: all
  `page`      Number          Page number (defaults to `1`)
  `limit`     Number          Results per page (defaults to `5`)

### Sending a message

`POST /message/` accepts `multipart/form-data`. The receiver ID is
required. A message must include text content, at least one attachment,
or both. Up to three image attachments are accepted.

Example form fields:

``` text
receiverId: <user-id>
content: Your question or message
```

For an anonymous submission, omit the `Authorization` header. To submit
as a signed-in user, include the bearer access token.

### Authentication header

For protected endpoints, send the access token using the standard
bearer-token format:

``` http
Authorization: Bearer <access-token>
```

## File upload implementation

Uploads use **Multer memory storage**. Files are first held in memory,
then their actual file type is checked using `file-type`. Valid files
are written to local storage under the `assets/` directory, using
generated UUID-based filenames.

Current upload locations include:

-   `assets/messages/` for message attachments
-   `assets/users/` for profile images

The application exposes the `assets` directory through the `/assets`
static route. Files are stored on the server's local filesystem; this
implementation does **not** integrate with AWS S3 or another
object-storage service.

## Project structure

``` text
src/
├── DB/                  # Database connection and Mongoose models
├── common/              # Shared utilities, services, security, validation
├── middleware/          # Authentication, validation, uploads, error handling
├── modules/
│   ├── authentication/  # Registration, login, email and password flows
│   ├── message/         # Message endpoints and business logic
│   └── user/            # Profile and account endpoints
├── config.js            # Environment configuration
└── main.js              # Express application setup
```

## API testing and documentation

The API can be tested with Postman. A useful Postman collection can
group requests by Authentication, Users, and Messages, and use
collection or environment variables for the API base URL and access
token.

AI tools can assist with drafting endpoint descriptions, organizing
request examples, and maintaining API documentation. Generated
documentation should always be checked against the actual routes,
validation schemas, and response behavior.

## Current scope

The current implementation supports message creation, retrieval,
listing, and deletion. It does not expose a separate endpoint for
answering or editing a question/message.

## Notes

-   The API requires reachable MongoDB and Redis instances during
    startup.
-   Email-based account flows require working SMTP credentials.
-   Google sign-in requires correctly configured Google Web Client
    ID(s).
-   Uploaded files are stored locally, so production deployments should
    account for persistent storage, backups, and disk capacity.
-   Do not use the example environment values as production secrets.

## Author

**Youssef Mahmoud**

-   GitHub: [Youssef-Mahmoud-A](https://github.com/Youssef-Mahmoud-A)
-   Repository:
    [ASKfm-Clone](https://github.com/Youssef-Mahmoud-A/ASKfm-Clone)
