const express = require('express')
const hbs = require('hbs')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')



const app = express()
const port = process.env.PORT



const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        // if (!file.originalname.endsWith('.pdf'))
        if (!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('Please upload a Word document'))
        }
        cb(undefined, true)
    }

})

const errorMiddleware = (req, res, next) => {
    throw new Error('From my middleware')
}

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})



app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app