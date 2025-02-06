
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) =>  {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) =>  {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  //befores saves the blog, we must check if the likes field is missing or not
  if (!blog.likes) {
    blog.likes = 0; //If it is missing, we set it to zero
  }
  //if the url or the title are missing, then we send a 400 bad request 
  else if (!blog.url || !blog.title){
    response.status(400).end()    
  }
  const result = await blog.save()
  response.status(201).json(result)
})

module.exports = blogsRouter
