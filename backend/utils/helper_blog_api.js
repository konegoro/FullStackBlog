const Blog = require('../models/blog')

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const nonExistingId = async () => {
    const blog = new Blog({
                            title: "forgotten",
                            author: "Nobody",
                            url: "https://nobody.com",
                            likes: 0,
                        })
    await blog.save()
    await blog.deleteOne()
  
    return blog._id.toString()
  }

module.exports = {blogsInDb, nonExistingId}