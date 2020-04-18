const express = require('express')
const Task = require('../models/task')
const router = express.Router()
const auth = require('../middleware/auth')

router.post('/tasks', auth, async(req, res) => {

    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(e)
    }


})


// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0
// GET /tashks?sortBy=createdAt:desc
router.get('/tasks', auth, async(req, res) => {

    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }


    try {
        // const tasks = await Task.find({ owner: req.user._id })
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(201).send(req.user.tasks)
    } catch (error) {
        res.status(500).send()
    }
})


router.get('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id

    try {
        //const task = await Task.findById(_id)
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })

        if (!task) {
            return res.status(404).send()
        }
        res.status(201).send(task)
    } catch (error) {
        res.status(500).send()
    }
})


router.patch('/tasks/:id', auth, async(req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed', 'description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        const _task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!_task) {
            return res.status(404).send()
        }

        updates.forEach((update) => {
            _task[update] = req.body[update]
        })
        await _task.save()
        res.status(201).send(_task)
    } catch (error) {
        res.status(400).send(error)
    }
})


router.delete('/tasks/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) { return res.status(404).send() }

        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }

})

module.exports = router