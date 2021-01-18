const express = require('express');
const Task = require('../models/tasks');
const auth = require('../middleware/authorization');
const router = express.Router();


//routes for tasks collection in db
//creating task
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    
    try {
        await task.save();
        res.status(201).send(task);
    } catch (err) {
        res.status(400).send();
    }
})
//reading all the task 
//tasks?completed=true/false
//tasks?limit=10&skip=10
//tasks?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};
    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();

        res.send(req.user.tasks);
    } catch (err) {
        res.status(500).send();
    }
})
//reading task using id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if(!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (err) {
        res.status(500).send();
        
    }
})
//updating tasks
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every(element => allowedUpdates.includes(element));
    if(!isValidOperation) {
        return res.status(400).send({ Error: 'invalid update!!'});
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if(!task) {
            return res.status(404).send();
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.send(task);
    } catch (err) {
        res.status(400).send();
    }
})

router.delete("/tasks/:id", auth, async (req, res) => {
    try{
        await Task.deleteOne({ _id: req.params.id, owner: req.user._id });
        res.send("Task Deleted!");
    } catch(e){
        res.status(500).send();
    }
})


module.exports = router;