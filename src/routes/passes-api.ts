import express from 'express'
import { auth, requiredScopes } from 'express-oauth2-jwt-bearer'
import QRCode from 'qrcode'
import { getPass, createPass } from '../db/passes.ts'
import { baseURL } from '../config.ts'

const router = express.Router()
router.use(auth({
  audience: 'web2-passes',
  issuerBaseURL: process.env.ISSUER_BASE_URL
}))

router.get('/:id', requiredScopes('read:passes'), async (req: express.Request<{ id: string }>, res) => {
  const pass = await getPass(req.params.id)
  if (pass === undefined) {
    return res.sendStatus(404)
  }
  res.json(pass)
})

router.post('/', requiredScopes('create:passes'), express.json(), async (req, res) => {
  const name = req.body?.name
  const document = req.body?.document
  if (typeof name !== 'string' || name.trim() === '' ||
      typeof document !== 'string' || document.trim() === '') {
    return res.sendStatus(400)
  }
  const pass = await createPass(name.trim(), document.trim())
  const png = await QRCode.toBuffer(`${baseURL}/info/${pass.id}`)
  res.status(201)
    .location(`${baseURL}/passes/${pass.id}`)
    .type('png')
    .send(png)
})

export default router
