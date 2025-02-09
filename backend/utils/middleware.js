const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const tokenExtractor = (request, response, next) => {
  // code that extracts the token
  const authorization = request.get('authorization') //authorization field in the header
  if (authorization && authorization.startsWith('Bearer ')) { //starts with the key word Bearer
    request.token = authorization.replace('Bearer ', '') //rid the key word
  }
  next()
}

const userExtractor = async (request, response, next) => {
  //verify that the Token matches with the SECRET variable, and if the token it's rigth, will have the user's id and
  //and the username
  const decodedToken = jwt.verify(request.token, process.env.SECRET) //request.token is possible cause the tokenExtractor method in the middleware 
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)
  request.user = user
  next()
}

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }
  else if (error.name ===  'JsonWebTokenError') {
  return response.status(401).json({ error: 'token invalid' })
  } 
  else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({error: 'token expired'})
  }
  
  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}