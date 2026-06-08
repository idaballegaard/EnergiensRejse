import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import routes from './routes.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '32kb' }))
app.use(routes)

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`)
})
