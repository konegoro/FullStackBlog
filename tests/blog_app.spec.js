const { test, expect, beforeEach, describe, afterAll} = require('@playwright/test')
const { loginWith , createBlog, createBlogWithOutClickNewBlog} = require('./helper')


describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Superuser',
        username: 'konegoro',
        password: '123'
      }
    })
    await await page.goto('/')
  })
  
  test('Login form is shown', async ({ page }) => {
    const locatorUsername =  page.getByTestId('username')
    const locatorPassword =  page.getByTestId('password')
    const locatorLogginButton = page.getByRole('button', { name: 'login' })

    await expect(locatorUsername).toBeVisible()
    await expect(locatorPassword).toBeVisible()
    await expect(locatorLogginButton).toBeVisible()

  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'konegoro', '123')
      await expect(page.getByText('Superuser logged-in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'nobody', 'no-one')
  
      const errorDiv = page.locator('.errorMessage')
      await expect(errorDiv).toContainText('Invalid username or password')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
  
      await expect(page.getByText('nobody logged in')).not.toBeVisible()
      
    })
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'konegoro', '123')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'a blog created by playwright', 'konegoro', 'konegoro.cl')
      await expect(page.getByText('a blog created by playwright')).toBeVisible()
      await expect(page.getByText('konegoro')).toBeVisible()
    })

    describe('when a blog is already created', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'a blog created by playwright', 'konegoro', 'konegoro.cl')
      })

      test('like button works', async ({page}) => {
        const blog = page.locator('text=a blog created by playwright konegoro');
        await expect(blog).toBeVisible();
        const viewButton = page.locator('button', { hasText: 'view' });
        await expect(viewButton).toBeVisible();
        await viewButton.click();
        const ceroLikes = page.locator('text=likes 0');
        await expect(ceroLikes).toBeVisible();
        const likeButton = page.locator('button', { hasText: 'Like' });
        await expect(likeButton).toBeVisible();
        await likeButton.click();
        const oneLikes = page.locator('text=likes 1');
        await expect(oneLikes).toBeVisible();
      })

      test('remove button works', async ({page}) => {
        const blog = page.locator('text=a blog created by playwright konegoro');
        await expect(blog).toBeVisible();
        const viewButton = page.locator('button', { hasText: 'view' });
        await expect(viewButton).toBeVisible();
        await viewButton.click();
        // Handle the confirm dialog BEFORE clicking the remove button
        page.on('dialog', async (dialog) => {
          console.log(`Dialog message: ${dialog.message()}`);
          await dialog.accept(); // Clicks "Aceptar"
        });
        const removeButton = page.locator('button', { hasText: 'remove' });
        await expect(removeButton).toBeVisible();
        await removeButton.click();

        // Verify that the blog is removed
        await expect(page.locator('text=a blog created by playwright konegoro')).not.toBeVisible();
      })

      test('remove button only apperas with the rigth user', async ({page, request}) => {
        //create the new user
        await request.post('/api/users', {
          data: {
            name: 'nacho',
            username: 'hound',
            password: '123'
          }
        })
        //Log out
        const logOutButton = page.locator('button', { hasText: 'Logout' });
        await expect(logOutButton).toBeVisible();
        await logOutButton.click();
        // Wait for the green notification to disappear
        await page.locator('text=a new blog created').waitFor({ state: 'hidden' });
        //Log in with another user
        await loginWith(page, 'hound', '123');
        //view the blog created by konegoro
        const blog = page.locator('text=a blog created by playwright konegoro');
        await expect(blog).toBeVisible();
        const viewButton = page.locator('button', { hasText: 'view' });
        await expect(viewButton).toBeVisible();
        await viewButton.click();
        //check that the removeButton is not on the page
        const removeButton = page.locator('button', { hasText: 'remove' });
        await expect(removeButton).not.toBeAttached(); // Ensures the button does not exist at all
      })
      test('blogs are arranged by the likes', async ({page, request}) => {
        //create another blog
        await createBlogWithOutClickNewBlog(page, 'Blog 2', 'konegoro', 'konegoro.cl')
        const blogContainer = page.locator('.divBlog').filter({ hasText: 'Blog 2 konegoro' });
        await expect(blogContainer).toBeVisible();
        
        // Buscar el botón dentro del contenedor del blog
        const viewButton = blogContainer.locator('.ShowButton');
        
        // Esperar hasta que el botón esté visible
        await expect(viewButton).toBeVisible();
        await viewButton.click();

        //Click in likes
        const blogContainerFull = page.locator('.divBlog').filter({ hasText: 'Blog 2' });
        const likeButton = blogContainerFull.locator('.likesButton');
        
        // Esperar hasta que el botón esté visible
        await expect(likeButton).toBeVisible();
        await likeButton.click();

        // Wait for some time for the order to update (you might need a small delay here)
        await page.waitForTimeout(500); // Optional: depends on how quickly your UI updates

        // Capture the blogs after liking
        const blogsAfterLike = await page.locator('.divBlog').allTextContents();
        console.log('After like:', blogsAfterLike); // Log to check the new order

        expect(blogsAfterLike[0]).toContain('Blog 2');  // Now Blog 2 should be the first
        expect(blogsAfterLike[1]).toContain('a blog created by playwright');  // Now Blog 1 should be the second


          
      })
    })

  })
})

afterAll(async ({ request }) => {
  await request.post('/api/testing/reset')
})