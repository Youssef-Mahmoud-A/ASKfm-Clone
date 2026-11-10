import express from 'express'
import { authenticationController, messageController, userController } from './modules/index.js'
import { globalErrorHandling } from './middleware/index.js'
import { bootstrapDB } from './DB/connection.db.js'
import { ORIGINS, PORT } from './config.js'
import cors from 'cors'
import helmet from 'helmet'
import { generateLimiter } from './common/utils/index.js'
import morgan from 'morgan'

const app = express()
await bootstrapDB(app, PORT);


var corsOptions = {
    origin: function (origin, callback) {
        if (!ORIGINS.includes(origin)) {
            callback(new Error("Unauthorized CROSS ORIGIN!!", { cause: { status: 401 } }), ORIGINS)
        } else {
            callback(null, ORIGINS)
        }
    }
}



app.set("trust proxy", true)
const limiter = generateLimiter({})
app.use(helmet(), cors(), morgan("common"), limiter, express.json());

app.use("/assets", express.static("./assets"))
app.all("/", (req, res) => res.status(200).send({ message: "Welcome to the API 👌" }))

app.use("/auth", authenticationController)
app.use("/message", messageController)
app.use("/user", userController)

app.all("{/*dummy}", (req, res) => res.status(404).send({ message: "Invalid application routing 🤷‍♂️" }))

app.use(globalErrorHandling)

