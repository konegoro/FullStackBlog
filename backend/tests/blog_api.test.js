const { test, after, beforeEach, describe} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const User = require('../models/user')
const {blogsInDb, nonExistingId, initialBlogs, getToken} = require('./helper_blog_api')
const {initialUsers, usersInDb} = require('./helper_user_api')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of initialBlogs) {
        const blogObject = new Blog(blog)
        await blogObject.save()
    }

    //to POST the blogs with a user wee need initialize the Users
    await User.deleteMany({})

    for (let user of initialUsers) {
        await api
            .post('/api/users')
            .send(user)
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
        const token = await getToken('Nobody', '123')    
        const blogsAtStart = await blogsInDb();
        const blogToAdd =    {
            title: "Arica is nice",
            author: "El Morro",
            url: "https://arica.cl",
            likes: 10,
        }
        
        await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogToAdd)
        .expect(201)
        
        //check the length is now one more than before
        const blogsAtEnd = await blogsInDb();
        assert.strictEqual(blogsAtEnd.length - 1, blogsAtStart.length)    
        //check the are the same
        const titles = blogsAtEnd.map(blog => blog.title)
        assert(titles.includes("Arica is nice"))             
    })
    test('likes field set it in zero when was missed', async () => {
        const token = await getToken('Nobody', '123')
        const blogsAtStart = await blogsInDb();
        const blogToAdd =    {
            title: "Arica it's nice",
            author: "El Morro",
            url: "https://arica.cl", //likes missed
        }
        const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogToAdd)
        .expect(201)
        
        //check the length is now one more than before
        const blogsAtEnd = await blogsInDb();
        assert.strictEqual(blogsAtEnd.length - 1, blogsAtStart.length)    
        //check that likes is zero
        assert.strictEqual(0, response.body.likes)
    })
    test('missing title field', async () => {
        const token = await getToken('Nobody', '123')
        const blogToAdd =    {
            author: "El Morro", //likes missed
            url: "https://arica.cl", 
            likes: 10
        }
        await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogToAdd)
        .expect(400) //bad request
        
    })
    test('missing url field', async () => {
        const token = await getToken('Nobody', '123')
        const blogToAdd =    {
            title: "Arica it's nice",
            author: "El Morro", //url missed
            likes: 10
        }
        await api
        .post('/api/blogs')
        .send(blogToAdd)
        .set('Authorization', `Bearer ${token}`)
        .expect(400) //bad request
        
    })
})

describe('DELETE', () => {
    test('A user deletes a blog he created ', async () => {
        //first we add a blog with the user, this is necessary cause intialBlogs don't have users
        const token = await getToken('Nobody', '123')    
        const blogToAdd =    {
            title: "Arica is nice",
            author: "El Morro",
            url: "https://arica.cl",
            likes: 10,
        }
        
        await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogToAdd)
        .expect(201)


        const blogsAtStart = await blogsInDb();
        const blogToDelete = blogsAtStart.find(blog => blog.title === 'Arica is nice') //the newly added
        const idBlogToDelete = blogToDelete.id
        
        //deleted the blog
        await api
            .delete(`/api/blogs/${idBlogToDelete}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
    
        const blogsAtEnd = await blogsInDb();
        //check there is one less
        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
        //check that the deleted one is the correct
        // Ensure the deleted blog no longer exists in the database
        const deletedBlog = blogsAtEnd.find(b => b.id === idBlogToDelete);
        assert.strictEqual(deletedBlog, undefined);                           
    
    })
    test('A user tries to delete a blog he did not created ', async () => {
        //first we add a blog with the user, this is necessary cause intialBlogs don't have users
        const token = await getToken('Nobody', '123')    
        const blogToAdd =    {
            title: "Arica is nice",
            author: "El Morro",
            url: "https://arica.cl",
            likes: 10,
        }
        
        await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogToAdd)
        .expect(201)


        const blogsAtStart = await blogsInDb();
        const blogToDelete = blogsAtStart.find(blog => blog.title === 'Arica is nice') //the newly added
        const idBlogToDelete = blogToDelete.id
        
        //deleted the blog, but with other token
        const anotherToken = await getToken("Nobody 2", "123")
        // console.log("the anoter token is ", anotherToken)
        await api
            .delete(`/api/blogs/${idBlogToDelete}`)
            .set('Authorization', `Bearer ${anotherToken}`)
            .expect(401)
    
        const blogsAtEnd = await blogsInDb();
        //check the is the same amount
        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)                         
    
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
