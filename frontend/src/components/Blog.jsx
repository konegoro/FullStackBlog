
import { useState, useEffect } from 'react';
import blogService from '../services/blogs'
import tokenService from '../services/token'

const timerMessages = 5000

const Blog = ({blog, blogs, setBlogs, setErrorMessage, user}) => {
  const [hide, sethide] = useState(true)
  const [canDelete, setCanDelete] = useState(false); // Estado para saber si se puede borrar

  //------------------------Hooks.-------------------
  useEffect(() => {
    const checkCanDelete = async () => {
      try {
        //I coud have modify the login response, adding the user's id, but is more secure verify with the token
        const response = await tokenService.getId(user.token);
        const userId = response.data.userId;
        setCanDelete(userId === blog.user.id);
      } catch (error) {
        console.error("Error checking delete permission:", error);
      }
    };
    checkCanDelete();
  }, [user, blog]);
  //------------Style----------------
  const blogStyle = {
    border: '1px solid black',
    padding: '10px',
    marginBottom: '10px',
    maxWidth: '500px',
    fontFamily: 'Arial, sans-serif',
  };

  const deleteButtonStyle = {
    backgroundColor: '#ffcccc', // Light red
    color: 'black', // Text color
    border: '1px solid #ff8888', // Slightly darker red border
    padding: '5px 10px',
    borderRadius: '5px', // Rounded corners
    cursor: 'pointer',
    fontWeight: 'bold',
  };

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
      setErrorMessage("Something went wrong : ", exception.message)
      setTimeout(() => setErrorMessage(null), timerMessages)
    }
  }

  const removeBlog = async (blog) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${blog.title}" by ${blog.author}?`);
    
    if (!confirmDelete) {
      return; // Exit the function if the user cancels
    }
  
    try {
      // DELETE THE BLOG
      await blogService.remove(blog.id);
  
      // Update the blogs in the frontend
      const newBlogs = blogs.filter(b => b.id !== blog.id);
      setBlogs(newBlogs);
    } catch (exception) {
      setErrorMessage("Something went wrong: " + exception.message);
      setTimeout(() => setErrorMessage(null), timerMessages);
    }
  };
  

  console.log("canDetele is : ", canDelete)
  return (
    <div>
      <button onClick={() => sethide(!hide)}>
          {hide ? 'view' : 'hide'}
      </button>
      {hide ? 
      <div style={blogStyle}>
        {blog.title} {blog.author}
      </div>
      : 
      <div style={blogStyle}> 
        <p>{blog.title}</p>
        <p>{blog.url}</p>
        <p>likes {blog.likes} <button onClick={() => updateLikes(blog)}> Like </button> </p>
        <p>{blog.author}</p>
        {canDelete ? 
        <button style={deleteButtonStyle} onClick={() => {
                                                          removeBlog(blog)}}> remove </button>
        :
        null}
      </div>
      }
    </div>  
  )
}

export default Blog