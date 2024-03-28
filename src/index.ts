import express from 'express'
import userRouter from './routes/users.routes'
import databaseService from './services/database.services'
const app = express()
const port = 3000
app.use(express.json())
// Connect to MongoDB
databaseService.connect()
app.use('/users', userRouter)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
