import axios from 'axios'
const baseUrl = '/api/token'

const getId = async (token) => {
  const id = await axios.get(`${baseUrl}/${token}`)
  return id
}

export default { getId }