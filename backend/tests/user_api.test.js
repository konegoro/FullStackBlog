const { test, after, beforeEach, describe} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const User = require('../models/user')
const Blog = require('../models/blog')
const {usersInDb, nonExistingId, initialUsers} = require('./helper_user_api')

const api = supertest(app)

beforeEach(async () => {
    //must have this way to generate the passwordHash
    for (let user of initialUsers) {
        await api
            .post('/api/users')
            .send(user)
    }
})

describe('when there are some users save initially', () => {
    test('users are returned as a JSON', async () => {
        const response = await api
                        .get('/api/users')
                        .expect(200)
                        .expect('Content-Type', /application\/json/)
    
    })
    test('all users are returned', async () => {
        const response = await api.get('/api/users')
        
        assert.strictEqual(response.body.length, initialUsers.length)
    })
    
    test('a specific user is within the returned users', async () => {
        const response = await api.get('/api/users')
        
        const usernames = response.body.map(u => u.username)
        assert(usernames.includes('Nobody'))
    })
})

describe('POST', () => {
    test('POST a correct user, unique username and username and password at leas 3 characters long', async () => {
        const newUser = {
            name: "hola", 
            username: "Bastian Corrales", //unique
            password: "12o31o1emk113k131k13"
        }

        const usersAtStart = await usersInDb();
        const response = await api
                        .post('/api/users')
                        .send(newUser)
                        .expect(201)
                        .expect('Content-Type', /application\/json/)
        
        
        const usersAtEnd= await usersInDb();
                                
        //check the length its one more afther the POST
        assert.strictEqual(usersAtStart.length + 1, usersAtEnd.length)                                

        //check the new added user is the correct one
        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes("Bastian Corrales"))    
    })
    test('POST a invalid 2 chars long username ', async () => {
        const newUser = {
            name: "hola", 
            username: "BC", //unique but long 2
            password: "12o31o1emk113k131k13"
        }

        const usersAtStart = await usersInDb();
        const response = await api
                        .post('/api/users')
                        .send(newUser)
                        .expect(400)
        
        
        const usersAtEnd= await usersInDb();
                                
        //check the length it is the same
        assert.strictEqual(usersAtStart.length, usersAtEnd.length)                                
    })
    test('POST a invalid 2 chars long password ', async () => {
        const newUser = {
            name: "hola", 
            username: "Bastian Corrales", //unique
            password: "12"
        }

        const usersAtStart = await usersInDb();
        const response = await api
                        .post('/api/users')
                        .send(newUser)
                        .expect(400)
        
        
        const usersAtEnd= await usersInDb();
                                
        //check the length it is the same
        assert.strictEqual(usersAtStart.length, usersAtEnd.length)                                
    })
    test('POST a invalid duplicated username ', async () => {
        const newUser = {
            name: "hola", 
            username: "Nobody", //not UNIQUE
            password: "1231313" //good
        }

        const usersAtStart = await usersInDb();
        const response = await api
                        .post('/api/users')
                        .send(newUser)
                        .expect(400)
        
        
        const usersAtEnd= await usersInDb();
                                
        //check the length it is the same
        assert.strictEqual(usersAtStart.length, usersAtEnd.length)                                
    })
})


after(async () => {
    await mongoose.connection.close()
})