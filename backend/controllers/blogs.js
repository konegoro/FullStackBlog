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

blogsRouter.delete('/:id', async (request, response) => {
  const deletedBlog = await Blog.findByIdAndDelete(request.params.id)
  if (deletedBlog){
    response.json(deletedBlog)
  }
  else {
    response.status(404).end()
  }
})


blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedblog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  if (updatedblog) {
    response.json(updatedblog)
  }
  else {
    response.status(404).end()
  }

})

module.exports = blogsRouter
