import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import LogOut from './components/LogOut'
import BlogForm from './components/BlogForm'
import Togglable from './components/Toggable'
import blogService from './services/blogs'
import loginService from './services/login'
import {SuccessfulMessage, ErrorMessage} from './components/Messages'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newURL, setNewURL] = useState('')
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  //-----------------Gloval variables-----------------
  const timerMessages = 5000;
  const sortBlogs = blogs.sort((blog1, blog2) => blog2.likes - blog1.likes)

  //----------------------Hooks--------------------------
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await blogService.getAll();
        setBlogs(blogs);
      } catch (exception) {
        console.log(exception);
      }
    };
  
    fetchBlogs();
  }, []); // Dependency array remains empty
  

  //check if the user is saved in local storage
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])
  
  //------------------Auxiliar Functions-------------
  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('logging in with', username, password)
    
    try {
      const user = await loginService.login({username, password})
      //save the user in the Local Storage in the browser, so if the user re-render the web won't have to loggin again
      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      ) 
      blogService.setToken(user.token)
      console.log("user is : ", user)
      setUser(user)
      setUsername('')
      setPassword('')
    }
    catch {
      setErrorMessage("Invalid username or password")
      setTimeout(() => setErrorMessage(null), timerMessages)
    }
  }

  const addBlog = async (event) => {
    event.preventDefault()
    const blogObject = {
      title: newTitle,
      author: newAuthor,
      url: newURL,
    }
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      setNewTitle('')
      setNewAuthor('')
      setNewURL('')
      setSuccessMessage(`a new blog ${newTitle} by ${newAuthor}`)
      setTimeout(() => setSuccessMessage(null), timerMessages)
    } catch(exception) {
        setErrorMessage(exception.message)
        setTimeout(() => setErrorMessage(null), timerMessages)
    }
  }

  const handelTitleChange = (event) => {
    console.log("New Title now is : ", event.target.value)
    setNewTitle(event.target.value)
  }
  const handelAuthorChange = (event) => {
    console.log("New Author now is : ", event.target.value)
    setNewAuthor(event.target.value)
  }
  const handelURLChange = (event) => {
    console.log("New URL now is : ", event.target.value)
    setNewURL(event.target.value)
  }

  //-------------------------------HTML-------------------------
  return (
    <div>
      <SuccessfulMessage message={successMessage} />
      <ErrorMessage message={errorMessage} />
      {user === null ?
       <LoginForm handleLogin={handleLogin} username={username} password={password} setUsername={setUsername} setPassword={setPassword} />
      :
      <div>
        <p>{user.name} logged-in</p>
        <LogOut setUser={setUser} />
        <h2>Create New Blog</h2>
        <Togglable buttonLabel="new note">
          <BlogForm addBlog={addBlog} newTitle={newTitle} newAuthor={newAuthor} newURL={newURL} handelTitleChange={handelTitleChange} 
                    handelAuthorChange={handelAuthorChange} handelURLChange={handelURLChange}/>
        </Togglable>
        <h2>blogs</h2>
        {sortBlogs.map(blog =>
          <Blog key={blog.id} blog={blog} blogs={blogs} setBlogs={setBlogs} setErrorMessage={setErrorMessage} user={user}/>
        )}
      </div>
      }
    </div>
  )
}

export default App