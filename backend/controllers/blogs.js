const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware');

blogsRouter.get('/', async (request, response) =>  {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
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

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  // get user from request object
  const user = request.user

  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id //add the userID to the Note
  })
  
  //befores saves the blog, we must check if the likes field is missing or not
  if (!blog.likes) {
    blog.likes = 0; //If it is missing, we set it to zero
  }
  //if the url or the title are missing, then we send a 400 bad request 
  else if (!blog.url || !blog.title){
    response.status(400).end()    
  }

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog.id) //add the blog to the user with concat
  await user.save() //save the data

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  // get user from request object
  const user = request.user

  // console.log("the user id is : ", user.id.toString())
  const blog = await Blog.findById(request.params.id)
  // console.log("the user id who has the blog is : ", blog.user.toString())
  if (user.id.toString() !== blog.user.toString()){
    return response.status(401).json({ error: 'Only the user who created the blog can delete it' })
  }
  //deleted the blog id from the user in the field blogs, this is just in case, because with population
  //the deleted blog should not appear in the user's blogs
  // console.log("user blogs was: ", user.blogs)
  user.blogs = user.blogs.filter(b => b.toString() !== request.params.id)
  await user.save(); // <---- Save the updated user document
  // console.log("user blogs is now : ", user.blogs)
  //deleted the blog from the database
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
    user: body.user,
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedblog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true }).populate('user', { username: 1, name: 1 })
  if (updatedblog) {
    response.json(updatedblog)
  }
  else {
    response.status(404).end()
  }

})

module.exports = blogsRouter
