import express from 'express'
import { getPass } from '../db/passes.ts'

const router = express.Router()

router.get('/:id', async (req, res) => {
  const pass = await getPass(req.params.id)
  if (pass === undefined) {
    return res.sendStatus(404)
  }
  res.render('info', { pass })
})

export default router
