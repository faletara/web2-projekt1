import dotenv from 'dotenv'
dotenv.config()

export const port = process.env.PORT ? parseInt(process.env.PORT) : 4080
export const baseURL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`
