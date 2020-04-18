const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')



router.post('/users', async(req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)

        const token = await user.generateAuthToken()


        res.status(201).send({ user, token })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/login', async(req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }

})


router.post('/users/logout', auth, async(req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.status(200).send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutall', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send()
    }
})



router.get('/users', auth, async(req, res) => {

    try {
        const users = await User.find({})
        res.status(201).send(users)
    } catch (error) {
        res.status(401).send(error)
    }
})

router.get('/users/me', auth, async(req, res) => {

    res.send(req.user)
})

router.get('/users/:id', async(req, res) => {
    try {
        const _id = req.params.id
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.status(201).send(user)
    } catch (error) {
        res.status(500).send()
    }
})

router.delete('/users/me', auth, async(req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if (!user) {
        //     return res.status(404).send()
        // }

        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/users/me', auth, async(req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdate.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {


        // const user = await User.findById(req.params.id)

        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()

        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        // if (!user) {
        //     return res.status(404).send()
        // }

        res.status(201).send(req.user)

    } catch (error) {
        res.status(400).send(error)

    }
})
const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('The file should be JPG or JPEG or PNG'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 300, height: 300 }).png().toBuffer()

    req.user.avatar = buffer
        //req.user.avatar = req.file.buffer
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async(req, res) => {

    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()

})

router.get('/users/:id/avatar', async(req, res) => {

    try {

        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('')
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }

})


module.exports = router