const BlogForm = ({ addBlog, newTitle, newAuthor, newURL, handelTitleChange, handelAuthorChange, handelURLChange }) => (
  <form onSubmit={addBlog} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label>
        Title:
      <input value={newTitle} onChange={handelTitleChange} />
    </label>
    <label>
        Author:
      <input value={newAuthor} onChange={handelAuthorChange} />
    </label>

    <label>
        URL:
      <input value={newURL} onChange={handelURLChange} />
    </label>

    <button type="submit" style={{ width: '100px', alignSelf: 'left' }}>Create</button>
  </form>
)

export default BlogForm