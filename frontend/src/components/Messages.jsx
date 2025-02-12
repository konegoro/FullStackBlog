const SuccessfulMessage = ({message}) => {
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
  
  // eslint-disable-next-line react/prop-types
  const ErrorMessage = ({message}) => {
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

  export {SuccessfulMessage, ErrorMessage}