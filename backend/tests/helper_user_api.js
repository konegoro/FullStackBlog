const User = require('../models/user')

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

const nonExistingId = async () => {
    const user = new User({
                            name: "hola",
                            username: "Nobody",
                            passwordHash: "9139113031ke1j2k1jk123jkj12031392k21kj1931"                       
                        })
    await user.save()
    await user.deleteOne()
  
    return user.id.toString()
}

const initialUsers = [
    {
        name: "hola",
        username: "Nobody",
        password: "123"               
    },
    {
        name: "hola 2",
        username: "Nobody 2",
        password: "123"                       
    },
    {
        name: "hola 3",
        username: "Nobody 3",
        password: "123"
    }
]

module.exports = {usersInDb, nonExistingId, initialUsers}
