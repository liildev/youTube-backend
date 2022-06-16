import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import upload from 'express-fileupload'
import userRouter from './routers/user.js'
import videoRouter from './routers/video.js'

const PORT = process.env.PORT || 5005


const app = express()

app.use(express.json())
app.use(cors())
app.use(upload())
app.use(express.static(path.join(process.cwd(), 'uploads')))
app.use(userRouter)
app.use(videoRouter)


app.use((error, req, res, next) => {
    if(error.status != 500){
        return res.status(error.status).json({
            status: error.status,
            message: error.message
        })
    }

    fs.appendFileSync(path.join(process.cwd(), 'src', 'log.txt'),
        `${req.url}___${error.name}___${error.message}___${error.status}___${Date.now()}\n`
    )

    res.status(error.status).json({
        status: error.status,
        message: 'InternalServerError'
    })

    process.exit()
})




app.listen(PORT, () => console.log(`*${PORT}`))