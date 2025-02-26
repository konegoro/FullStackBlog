
import { useState, useEffect } from 'react'
import blogService from '../services/blogs'
import tokenService from '../services/token'
import PropTypes from 'prop-types'

const timerMessages = 5000

const Blog = ({ blog, blogs, setBlogs, setErrorMessage, user }) => {
  const [hide, sethide] = useState(true)
  const [canDelete, setCanDelete] = useState(false) // Estado para saber si se puede borrar
  console.log("canDeleteDefautl is : ", blog.canDeleteDefault)
  console.log("user is : ", user)

  //----------------checkCanDelete-----------------
  useEffect(() => {
    const checkCanDelete = async () => {
      if (blog.canDeleteDefault) {
        setCanDelete(blog.canDeleteDefault);
        blog.canDeleteDefault = null
      }
      try {
        const response = await tokenService.getId(user.token);
        const userId = response.data.userId;
        console.log("userId from the token : ", userId)
        console.log("user from the blog", blog.user.id)
        setCanDelete(userId === blog.user.id);
      } catch (error) {
        console.error('Error checking delete permission:', error);
        setCanDelete(false); // Fail-safe: Don't allow delete on error
      }
    }
  
    checkCanDelete();
  }, [user, blog, blogs]); // Runs when user, blogs, or blog changes
  
  //------------Style----------------
  const blogStyle = {
    border: '1px solid black',
    padding: '10px',
    marginBottom: '10px',
    maxWidth: '500px',
    fontFamily: 'Arial, sans-serif',
  }

  const deleteButtonStyle = {
    backgroundColor: '#ffcccc', // Light red
    color: 'black', // Text color
    border: '1px solid #ff8888', // Slightly darker red border
    padding: '5px 10px',
    borderRadius: '5px', // Rounded corners
    cursor: 'pointer',
    fontWeight: 'bold',
  }

  //-----------Auxiliar functions------------------
  const updateLikes = async (blog) => {
    const blogObject = {
      user: blog.user.id,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url
    }
    // console.log("the object is : ", blogObject)
    // console.log("blog's id is  : ", blog.id)
    try {
      const updatedNote = await blogService.update(blog.id, blogObject)
      //Update the blogs to have a inmediatly render
      const newBlogs = blogs.map(b => b.id===blog.id ? updatedNote : b)
      setBlogs(newBlogs)
    }
    catch (exception) {
      setErrorMessage('Something went wrong : ', exception.message)
      setTimeout(() => setErrorMessage(null), timerMessages)
    }
  }

  const removeBlog = async (blog) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${blog.title}" by ${blog.author}?`)

    if (!confirmDelete) {
      return // Exit the function if the user cancels
    }

    try {
      // DELETE THE BLOG
      await blogService.remove(blog.id)

      // Update the blogs in the frontend
      const newBlogs = blogs.filter(b => b.id !== blog.id)
      setBlogs(newBlogs)
    } catch (exception) {
      setErrorMessage('Something went wrong: ' + exception.message)
      setTimeout(() => setErrorMessage(null), timerMessages)
    }
  }

  console.log("canDelete is : ", canDelete)
  return (
    <div className='divBlog'>
      <button className="ShowButton" onClick={() => {sethide(!hide)}}>
        {hide ? 'view' : 'hide'}
      </button>
      {hide ?
        <div className="blog" style={blogStyle}>
          {blog.title} {blog.author}
        </div>
        :
        <div style={blogStyle}>
          <p>{blog.title}</p>
          <p>{blog.url}</p>
          <p>likes {blog.likes} <button className="likesButton" onClick={() => updateLikes(blog)}> Like </button> </p>
          <p>{blog.author}</p>
          {canDelete ?
            <button style={deleteButtonStyle} onClick={() => removeBlog(blog)}> remove </button>
            :
            null}
        </div>
      }
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  blogs: PropTypes.array.isRequired,
  setBlogs: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
}

export default Blog