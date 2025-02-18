import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react';
import BlogForm from './BlogForm'
import { vi } from "vitest";

test('BlogForm works well', async () => {
    const createBlog = vi.fn()
    const setSuccessMessage = vi.fn()
    const setErrorMessage = vi.fn()
    const user = userEvent.setup()
  
    const {container} = render(<BlogForm createBlog={createBlog} setErrorMessage={setErrorMessage} setSuccessMessage={setSuccessMessage}/>)

    const inputTitle = container.querySelector('#title-input')
    const inputAuthor = container.querySelector('#author-input')
    const inputURL = container.querySelector('#url-input')

    await user.type(inputTitle, 'new blog')
    await user.type(inputAuthor, 'konegoro')
    await user.type(inputURL, 'konegoro.cl')

    const createButton = container.querySelector('.createButton')

    await user.click(createButton)
    //check that the function createBlog had been called once
    expect(createBlog.mock.calls).toHaveLength(1)
    //check that the inputs had been sended by the mock function
    expect(createBlog.mock.calls[0][0].title).toBe('new blog')
    expect(createBlog.mock.calls[0][0].author).toBe('konegoro')
    expect(createBlog.mock.calls[0][0].url).toBe('konegoro.cl')
})