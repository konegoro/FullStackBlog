const loginWith = async (page, username, password)  => {
    await page.getByTestId('username').fill(username)
    await page.getByTestId('password').fill(password)
    await page.getByRole('button', { name: 'login' }).click()
  }
  
const createBlog = async (page, title, author, url) => {
    await page.getByRole('button', { name: 'new blog' }).click()
    // Fill the form fields using input IDs
    await page.fill('#title-input', title);
    await page.fill('#author-input', author);
    await page.fill('#url-input', url);
     // Click the create button
    await page.getByRole('button', { name: 'Create' }).click()
     // Ensure the blog appears on the page (replace with the expected text)
    await page.getByText(title).waitFor()
    await page.getByText(author).waitFor()
}

const createBlogWithOutClickNewBlog = async (page, title, author, url) => {
  // Fill the form fields using input IDs
  await page.fill('#title-input', title);
  await page.fill('#author-input', author);
  await page.fill('#url-input', url);
   // Click the create button
  await page.getByRole('button', { name: 'Create' }).click()
   // Ensure the blog appears on the page (replace with the expected text)
  await page.getByText(title).waitFor()
  await page.locator('.blog').filter({ hasText: `${title} ${author}` }).waitFor();
}
  
export { loginWith, createBlog, createBlogWithOutClickNewBlog}