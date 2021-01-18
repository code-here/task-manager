const express = require('express')
const User = require('../models/users');
const auth = require('../middleware/authorization');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeMsg, sendCancelationMsg } = require('../emails/account');
const router = express.Router();



//routes for users collection in db
//creating users
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    
    try {
        await user.save();
        sendWelcomeMsg( user.email, user.name );
        const token = await user.generateAuthToken();                                             
        res.status(201).send({ user, token });
    } catch (err) {
        res.status(400).send(err);
    }
})

router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (err) {
        res.status(400).send(err);
    }
})

router.get("/users/logout", auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();

        res.send();
    } catch(err) {
        res.status(500).send();
    }
})

router.get("/users/logoutALL", auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch(err) {
        res.status(500).send()
    }
})

//read the user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

//updating user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'age', 'password'];
    const isValidOperation = updates.every(element => allowedUpdates.includes(element));
    if(!isValidOperation) {
        return res.status(400).send({ Error: 'invalid update!!'});
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);

        await req.user.save();

        res.send(req.user);
    } catch (err) {
        res.status(400).send();
    }
})

//delete user
router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelationMsg( req.user.email, req.user.name );
        res.send(req.user);
    } catch(err) {
        res.status(500).send();
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return cb(new Error("upload a valid image file (.png, .jpg, .jpeg)"));
        }

        cb(undefined, true);
    }
})
//upload user avatar
router.post('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ 'error': error.message });
})
//remove user avatar
router.delete('/user/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

//serving avatar image
router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user  = await User.findById(req.params.id);
        if( !user || !user.avatar ) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch(err) {
        res.status(404).send();
    }
})



module.exports = router;