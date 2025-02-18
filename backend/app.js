const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
require('express-async-errors')//must be here, before the routess
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const tokenRouter = require('./controllers/token')
const middleware = require('./utils/middleware')
const loginRouter = require('./controllers/login')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json()) //this allows that request.body has the correct data
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor) //to extract the token in the request

//blogsRouter use userExtractor inside, which needs tokenExtractor, so the order must be this
//tokenExtractor before blogsRouter
app.use('/api/blogs', blogsRouter) 
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/token', tokenRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app

