const SuccessfulMessage = ({ message }) => {
  if (message===null) {
    null
  }
  else {
    return (
      <div className='successfulMessage'>
        {message}
      </div>
    )
  }
}

const ErrorMessage = ({ message }) => {
  if (message===null) {
    null
  }
  else {
    return (
      <div className='errorMessage'>
        {message}
      </div>
    )
  }
}

export { SuccessfulMessage, ErrorMessage }