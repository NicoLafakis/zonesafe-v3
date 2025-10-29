import { Router, Request, Response } from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import db from '../config/database'

const router = Router()
const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID)

/**
 * POST /api/auth/google
 * Authenticate user with Google OAuth token
 */
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ error: 'No credential provided' })
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload) {
      return res.status(400).json({ error: 'Invalid token payload' })
    }

    const { sub: googleId, email, name, picture } = payload

    // Check if user exists
    const [rows] = await db.query(
      'SELECT id, email, name FROM users WHERE google_id = ? OR email = ?',
      [googleId, email]
    )

    let userId: number
    let userName: string | undefined = name

    if (Array.isArray(rows) && rows.length > 0) {
      // User exists - update last login
      const user = rows[0] as any
      userId = user.id
      userName = user.name

      await db.query(
        'UPDATE users SET last_login = NOW(), google_id = ?, profile_picture = ? WHERE id = ?',
        [googleId, picture, userId]
      )
    } else {
      // Create new user
      const [result] = await db.query(
        `INSERT INTO users (google_id, email, name, profile_picture, last_login)
         VALUES (?, ?, ?, ?, NOW())`,
        [googleId, email, name, picture]
      )
      userId = (result as any).insertId
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    const token = jwt.sign(
      { id: userId, email, name: userName },
      jwtSecret,
      { expiresIn: '30d' }
    )

    // Save session
    await db.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))',
      [userId, token]
    )

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action_type, action_details, ip_address) VALUES (?, ?, ?, ?)',
      [userId, 'login', JSON.stringify({ method: 'google' }), req.ip]
    )

    res.json({
      token,
      user: {
        id: userId,
        email,
        name: userName,
        picture,
      },
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
})

/**
 * POST /api/auth/logout
 * Logout user and invalidate token
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      // Delete session
      await db.query('DELETE FROM sessions WHERE token = ?', [token])
    }

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

    const decoded = jwt.verify(token, jwtSecret) as { id: number }

    const [rows] = await db.query(
      'SELECT id, email, name, profile_picture FROM users WHERE id = ?',
      [decoded.id]
    )

    if (Array.isArray(rows) && rows.length > 0) {
      res.json({ user: rows[0] })
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
