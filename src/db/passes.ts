import { DatabaseError } from 'pg'
import { pool } from './pool.ts'

export type PassStatus = 'ACTIVE' | 'CANCELLED'

export interface Pass {
  id: string
  name: string
  document: string
  issuedAt: Date
  status: PassStatus
}

function toPass(row: any): Pass {
  return {
    id: row.id,
    name: row.name,
    document: row.document,
    issuedAt: row.issued_at,
    status: row.status
  }
}

export async function countPasses(): Promise<{ total: number, active: number }> {
  const result = await pool.query(
    `SELECT COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active
     FROM passes`
  )
  const row = result.rows[0]
  return { total: Number(row.total), active: Number(row.active) }
}

export async function getPass(id: string): Promise<Pass | undefined> {
  try {
    const result = await pool.query(
      'SELECT id, name, document, issued_at, status FROM passes WHERE id = $1',
      [id]
    )
    if (result.rows.length === 0) return undefined
    return toPass(result.rows[0])
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      return undefined
    }
    throw error
  }
}

export async function listPasses(): Promise<Pass[]> {
  const result = await pool.query(
    'SELECT id, name, document, issued_at, status FROM passes ORDER BY issued_at DESC'
  )
  return result.rows.map(toPass)
}

export async function createPass(name: string, document: string): Promise<Pass> {
  const result = await pool.query(
    `INSERT INTO passes (name, document)
     VALUES ($1, $2)
     RETURNING id, name, document, issued_at, status`,
    [name, document]
  )
  return toPass(result.rows[0])
}

export async function cancelPass(id: string): Promise<Pass | undefined> {
  try {
    const result = await pool.query(
      `UPDATE passes
       SET status = 'CANCELLED'
       WHERE id = $1
       RETURNING id, name, document, issued_at, status`,
      [id]
    )
    if (result.rows.length === 0) return undefined
    return toPass(result.rows[0])
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      return undefined
    }
    throw error
  }
}

export async function deletePass(id: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'DELETE FROM passes WHERE id = $1',
      [id]
    )
    return result.rowCount === 1
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      return false
    }
    throw error
  }
}
