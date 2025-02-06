const Blog = require('../models/blog')

const blogsInDb = async () => {
    const notes = await Blog.find({})
    return notes.map(note => note.toJSON())
}

module.exports = {blogsInDb}