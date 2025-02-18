import { useState} from 'react'

const BlogForm = ({ createBlog, setSuccessMessage, setErrorMessage}) => {
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newURL, setNewURL] = useState('')

  const addBlog = async (event) => {
    event.preventDefault()
    const blogObject = {
      title: newTitle,
      author: newAuthor,
      url: newURL,
    }
    try {
      await createBlog(blogObject)
      setNewTitle('')
      setNewAuthor('')
      setNewURL('')
      setSuccessMessage(`a new blog created`)
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch(exception) {
      setErrorMessage(exception.message)
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  return (
    <form onSubmit={addBlog} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label>
          Title:
        <input value={newTitle} onChange={event => setNewTitle(event.target.value)} id='title-input'/>
      </label>
      <label>
          Author:
        <input value={newAuthor} onChange={event => setNewAuthor(event.target.value)} id='author-input'/>
      </label>

      <label>
          URL:
        <input value={newURL} onChange={event => setNewURL(event.target.value)} id='url-input'/>
      </label>

      <button className="createButton" type="submit" style={{ width: '100px', alignSelf: 'left' }}>Create</button>
    </form>
  )
}

export default BlogForm