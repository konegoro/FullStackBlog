const { test, after, beforeEach, describe} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const initialBlogs = require('../utils/dataForTests')
const {blogsInDb} = require('../utils/helper_blog_api')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of initialBlogs) {
        const blogObject = new Blog(blog)
        await blogObject.save()
    }
})

test('blogs are returned as a JSON', async () => {
    const response = await api
                    .get('/api/blogs')
                    .expect(200)
                    .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, initialBlogs.length)                    
})

test('unique identifiers are called id instead of _id ', async () => {
    //It can not be initalBlogs, cause this does not have the ids
    const blogsAtStart = await blogsInDb();
    const blogToView = blogsAtStart[0];
    const response = await api
                    .get(`/api/blogs/${blogToView.id}`)
                    .expect(200)
                    .expect('Content-Type', /application\/json/)

    //check the response is equal to the blog he requested                    
    assert.deepStrictEqual(blogToView, response.body)     
    //check if we do blogToView._id do es not work
    assert.strictEqual(blogToView._id, undefined)  
})

test('POST a blog', async () => {
    const blogsAtStart = await blogsInDb();
    const blogToAdd =    {
        title: "Arica it's nice",
        author: "El Morro",
        url: "https://arica.cl",
        likes: 10,
    }

    await api
        .post('/api/blogs')
        .send(blogToAdd)
        .expect(201)

    //check the length is now one more than before
    const blogsAtEnd = await blogsInDb();
    assert.strictEqual(blogsAtEnd.length - 1, blogsAtStart.length)    
    //check the are the same
    const titles = blogsAtEnd.map(blog => blog.title)
    assert(titles.includes("Arica it's nice"))             
})

describe('missing fields', () => {
    test('likes field set it in zero when was missed', async () => {
        const blogsAtStart = await blogsInDb();
        const blogToAdd =    {
            title: "Arica it's nice",
            author: "El Morro",
            url: "https://arica.cl", //likes missed
        }
        const response = await api
                            .post('/api/blogs')
                            .send(blogToAdd)
                            .expect(201)

        //check the length is now one more than before
        const blogsAtEnd = await blogsInDb();
        assert.strictEqual(blogsAtEnd.length - 1, blogsAtStart.length)    
        //check that likes is zero
        assert.strictEqual(0, response.body.likes)
    })
    test('missing title field', async () => {
        const blogToAdd =    {
            author: "El Morro", //likes missed
            url: "https://arica.cl", 
            likes: 10
        }
        await api
            .post('/api/blogs')
            .send(blogToAdd)
            .expect(400) //bad request

    })
    test('missing url field', async () => {
        const blogToAdd =    {
            title: "Arica it's nice",
            author: "El Morro", //url missed
            likes: 10
        }
        await api
            .post('/api/blogs')
            .send(blogToAdd)
            .expect(400) //bad request

    })
})


after(async () => {
    await mongoose.connection.close()
  })
