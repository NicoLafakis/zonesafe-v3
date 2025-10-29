import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import db from '../config/database'

const router = Router()

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    const [rows] = await db.query(
      `SELECT id, email, name, profile_picture, created_at, last_login
       FROM users
       WHERE id = ?`,
      [userId]
    )

    if (Array.isArray(rows) && rows.length > 0) {
      res.json({ user: rows[0] })
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

/**
 * GET /api/users/stats
 * Get user statistics
 */
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    // Get plan count
    const [planRows] = await db.query(
      'SELECT COUNT(*) as total FROM plans WHERE user_id = ?',
      [userId]
    )

    // Get most recent plan
    const [recentRows] = await db.query(
      `SELECT id, title, road_name, created_at
       FROM plans
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    )

    const stats = {
      totalPlans: Array.isArray(planRows) && planRows.length > 0 ? (planRows[0] as any).total : 0,
      mostRecent: Array.isArray(recentRows) && recentRows.length > 0 ? recentRows[0] : null,
    }

    res.json(stats)
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
