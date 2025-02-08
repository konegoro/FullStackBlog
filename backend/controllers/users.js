const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { content: 1, important: 1 })
    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const {username, name, password} = request.body;

    //check the password has been given and it's at least 3 characters long
    if (password.length < 3 && password!=undefined){
        response.status(400).json({ error: "Password must be at least 3 characters long." })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    const userSaved = await user.save();
    response.status(201).json(userSaved)
})

module.exports = usersRouter