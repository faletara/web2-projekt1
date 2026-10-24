import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import oidc from 'express-openid-connect'
import homeRouter from './routes/home.ts'
import infoRouter from './routes/info.ts'
import adminRouter from './routes/admin.ts'
import passesApiRouter from './routes/passes-api.ts'
import { port, baseURL } from './config.ts'
dotenv.config()
const { auth } = oidc

const app = express()
app.set('views', path.join(import.meta.dirname, 'views'))
app.set('view engine', 'pug')
const hostname = process.env.RENDER_EXTERNAL_URL ? '0.0.0.0' : '127.0.0.1'

app.use(auth({
  authRequired: false,
  idpLogout: true,
  secret: process.env.SESSION_SECRET,
  baseURL: baseURL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  clientSecret: process.env.CLIENT_SECRET,
  routes: {
    logout: false
  },
  authorizationParams: {
    response_type: 'code'
  }
}))

app.use('/', homeRouter)
app.use('/info', infoRouter)
app.use('/admin', adminRouter)
app.use('/passes', passesApiRouter)

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`)
})
