import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react';
import Blog from './Blog'
import { vi } from "vitest";
import blogService from "../services/blogs"

//this mock the getId function which verifies with the token
vi.mock('../services/token', () => ({
    default: {
      getId: vi.fn(() =>
        Promise.resolve({
          data: { userId: "67aa481b4f4ae8ba4c3ba337" } // mismo ID que blog.user.id
        })
      )
    }
}));
  

test('renders blog with only title and author', async () => {
    const blog =   {
        title: 'Ejemplo',
        author: 'konegoro',
        url: 'https://konegoro.cl',
        likes: 4,
        user: {id : "67aa481b4f4ae8ba4c3ba337"} //mock id
    }

    //mocks parameters
    const userObject = {}
    const blogs = []

    //mocks functions
    const setBlogs = vi.fn()
    const setErrorMessage = vi.fn()

    await act(async () => {
        render(<Blog blog={blog} blogs={blogs} setBlogs={setBlogs} setErrorMessage={setErrorMessage} user={userObject}/>);
    });

    //have to bee with exact:False because Ejemplo Konegoro are render in the same line
    const foundTitle = screen.getByText('Ejemplo', { exact: false })
    const foundAuthor = screen.getByText('konegoro', { exact: false })

    expect(foundTitle).toBeDefined()
    expect(foundAuthor).toBeDefined()

    //check that url and likes are'nt render
    const foundUrl = screen.queryByText ('https://konegoro.cl', { exact: false })
    const foundLikes = screen.queryByText ('4', { exact: false })

    expect(foundUrl).toBeNull();
    expect(foundLikes).toBeNull();
})

test('renders blog with url and likes when you click the button', async () => {
    const blog =   {
        title: 'Ejemplo',
        author: 'konegoro',
        url: 'https://konegoro.cl',
        likes: 4,
        user: {id : "67aa481b4f4ae8ba4c3ba337"} //mock id
    }

    //mocks parameters
    const userObject = {}
    const blogs = []

    //mocks functions
    const setBlogs = vi.fn()
    const setErrorMessage = vi.fn()

    let container;
    
    await act(async () => {
        const renderResult = render(<Blog blog={blog} blogs={blogs} setBlogs={setBlogs} setErrorMessage={setErrorMessage} user={userObject}/>);
        container = renderResult.container; // Guardamos container después del render
    });

    //have to bee with exact:False because Ejemplo Konegoro are render in the same line
    const foundTitle = screen.getByText('Ejemplo', { exact: false })
    const foundAuthor = screen.getByText('konegoro', { exact: false })

    expect(foundTitle).toBeDefined()
    expect(foundAuthor).toBeDefined()

    //press the botton ShowButton
    const user = userEvent.setup()
    const ShowButton = container.querySelector('.ShowButton')
    await user.click(ShowButton)

    //check that url and likes are render
    const foundURL = screen.getByText('https://konegoro.cl', { exact: false })
    const foundLikes = screen.getByText('4', { exact: false })

    expect(foundURL).toBeDefined()
    expect(foundLikes).toBeDefined()
})
test('likes are increased when clicking the like button twice', async () => {
    //We need to mock the function update from updateLikes which is within Blog.jsx
    //becuase is this function which makes the call to update the likes field
    //It would be eaiser if the updateLikes function were a Blog argument, but is not, and should not be, beacuse
    //it's only necessary inside Blog, not in App.jsx
    const mockUpdate = vi.fn()
    blogService.update = mockUpdate
  
    // Initial blog object
    const blog =   {
        title: 'Ejemplo',
        author: 'konegoro',
        url: 'https://konegoro.cl',
        likes: 4,
        user: {id : "67aa481b4f4ae8ba4c3ba337"} //mock id
    }
  
    const blogs = [blog]  // List with one blog for simplicity
    const userObject = {}
    const setBlogs = vi.fn()
    const setErrorMessage = vi.fn()

    let container;
    
    await act(async () => {
        const renderResult = render(<Blog blog={blog} blogs={blogs} setBlogs={setBlogs} setErrorMessage={setErrorMessage} user={userObject}/>);
        container = renderResult.container; // Guardamos container después del render
    });

    //press the botton ShowButton
    const user = userEvent.setup()
    const ShowButton = container.querySelector('.ShowButton')
    await user.click(ShowButton)
  
    // Find the like button and click it twice
    const likeButton = container.querySelector('.likesButton')
    await user.click(likeButton)
    await user.click(likeButton)
  
    // Assert: Check if the likes are updated correctly
    expect(mockUpdate).toHaveBeenCalledTimes(2)  // Check if update was called twice
})
