const { test, after, beforeEach, describe} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const initialBlogs = require('../utils/dataForTests')
const {blogsInDb, nonExistingId} = require('../utils/helper_blog_api')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of initialBlogs) {
        const blogObject = new Blog(blog)
        await blogObject.save()
    }
})

describe('when there are some blogs save initially', () => {
    test('blogs are returned as a JSON', async () => {
        const response = await api
                        .get('/api/blogs')
                        .expect(200)
                        .expect('Content-Type', /application\/json/)
    
        assert.strictEqual(response.body.length, initialBlogs.length)                    
    })
    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        
        assert.strictEqual(response.body.length, initialBlogs.length)
    })
    
    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs')
        
        const titles = response.body.map(b => b.title)
        assert(titles.includes('React patterns'))
    })
    
})
describe('GET', () => {
    test('succeeds with a valid id', async () => {
        const blogsAtStart = await blogsInDb()
  
        const blogToView = blogsAtStart[0]
  
        const resultBlog = await api
          .get(`/api/blogs/${blogToView.id}`)
          .expect(200)
          .expect('Content-Type', /application\/json/)
  
        assert.deepStrictEqual(resultBlog.body, blogToView)
    })
    test('fails with statuscode 404 if blog does not exist', async () => {
        const validNonexistingId = await nonExistingId()
  
        await api
          .get(`/api/blogs/${validNonexistingId}`)
          .expect(404)
    })
    test('fails with statuscode 400 id is invalid', async () => {
        const invalidId = '5a3d5da59070081a82a3445'
  
        await api
          .get(`/api/blogs/${invalidId}`)
          .expect(400)
    })

})
describe('POST', () => {
    test('valid blog', async () => {
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

describe('DELETE', () => {
    test('one existing blog', async () => {
        const blogsAtStart = await blogsInDb();
        const blogToDelete = blogsAtStart[0]
        const idBlogToDelete = blogToDelete.id
        
        await api
            .delete(`/api/blogs/${idBlogToDelete}`)
            .expect(200)
    
        const blogsAtEnd = await blogsInDb();
        //check there is one less
        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
        //check that the deleted one is the correct
        // Ensure the deleted blog no longer exists in the database
        const deletedBlog = blogsAtEnd.find(b => b.id === idBlogToDelete);
        assert.strictEqual(deletedBlog, undefined);                           
    
    })
    test('one non-existing blog', async () => {
        const validNonexistingId = await nonExistingId()
        await api
          .delete(`/api/blogs/${validNonexistingId}`)
          .expect(404)                          
    
    })
    test('one invalid id blog', async () => {
        const invalidId = '5a3d5da59070081a82a3445'
    
        await api
          .delete(`/api/blogs/${invalidId}`)
          .expect(400)                         
    })
})
describe('PUT', () => {
    test('a valid blog', async () => {
        const blogsAtStart = await blogsInDb();
        const blogToUpdate = blogsAtStart[0];
        const newBlog = {
            title: "Updated blog",
            author: "Negrodcc",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 313,
        }
        const response = await api
                        .put(`/api/blogs/${blogToUpdate.id}`)
                        .send(newBlog)
                        .expect(200)
        
        const blogsAtEnd = await blogsInDb();
        //check the amount of blogs does not change
        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)                        
        //check the blog returned is the new blog
        //to do that ne weed to add the id into the newBlog (this does not have any)
        newBlog.id = response.body.id
        assert.deepStrictEqual(response.body, newBlog)

    })
    test('one non-existing blog', async () => {
        const validNonexistingId = await nonExistingId()
        await api
          .put(`/api/blogs/${validNonexistingId}`)
          .expect(404)                          
    
    })
    test('one invalid id blog', async () => {
        const invalidId = '5a3d5da59070081a82a3445'
    
        await api
          .put(`/api/blogs/${invalidId}`)
          .expect(400)                         
    })
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

after(async () => {
    await mongoose.connection.close()
  })
