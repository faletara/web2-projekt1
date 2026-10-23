import express from 'express'
import oidc from 'express-openid-connect'
import { listPasses, cancelPass, deletePass } from '../db/passes.ts'
const { requiresAuth } = oidc

const router = express.Router()
router.use(requiresAuth())

router.get('/', async (req, res) => {
  const passes = await listPasses()
  res.render('admin', { passes })
})

router.post('/passes/:id/cancel', async (req, res) => {
  const pass = await cancelPass(req.params.id)
  if (pass === undefined) {
    return res.sendStatus(404)
  }
  res.redirect('/admin')
})

router.post('/passes/:id/delete', async (req, res) => {
  const deleted = await deletePass(req.params.id)
  if (!deleted) {
    return res.sendStatus(404)
  }
  res.redirect('/admin')
})

export default router
