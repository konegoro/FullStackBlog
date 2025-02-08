const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

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

blogsRouter.post('/', async (request, response) => {
  //verify that the Token matches with the SECRET variable, and if the token it's rigth, will have the user's id and
  //and the username
  const decodedToken = jwt.verify(request.token, process.env.SECRET) //request.token is possible cause the tokenExtractor method in the middleware 
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

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
  user.blogs = user.blogs.concat(savedBlog.id) //add the note to the user with concat
  await user.save() //save the data

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  //verify that the Token matches with the SECRET variable, and if the token it's rigth, will have the user's id and
  //and the username
  const decodedToken = jwt.verify(request.token, process.env.SECRET) //request.token is possible cause the tokenExtractor method in the middleware 
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  // console.log("the user id is : ", user.id.toString())
  const blog = await Blog.findById(request.params.id)
  // console.log("the user id who has the blog is : ", blog.user.toString())
  if (user.id.toString() !== blog.user.toString()){
    return response.status(401).json({ error: 'Only the user who created the blog can delete it' })
  }
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
