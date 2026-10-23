import express from 'express'
import { countPasses } from '../db/passes.ts'

const router = express.Router()

router.get('/', async (req, res) => {
  const counts = await countPasses()
  const loggedIn = req.oidc.isAuthenticated()
  res.render('index', { counts, loggedIn })
})

router.post('/logout', (req, res) => res.oidc.logout())

export default router
