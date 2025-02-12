const tokenRouter = require('express').Router()
const jwt = require('jsonwebtoken')

tokenRouter.get('/:token', async (request, response) => {
  try {
    const decodedToken = jwt.verify(request.params.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    return response.json({ userId: decodedToken.id }) // Return JSON response
  } catch (error) {
    return response.status(401).json({ error: 'token verification failed' })
  }
})

module.exports = tokenRouter