import express from 'express'
import purchases from './routes/purchases.'
const cors = require('cors')

const app = express()

app.get('/', (request, response) => {
  return response.json({ message: 'Server is running' })
})

app.use(cors())

app.use('/api/v1/purchases', purchases)

app.listen(3333)
