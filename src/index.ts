import express from 'express'
import userRouter from './routes/users.routes'
import databaseService from './services/database.services'
import defaultErrorHandler from './middlewares/error.middlewares'
// Connect to MongoDB
databaseService.connect()
const app = express()
const port = 4000
app.use(express.json())
app.use('/users', userRouter)
// Defaut error handler
app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
