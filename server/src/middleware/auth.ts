import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
    name?: string
  }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

    const decoded = jwt.verify(token, secret) as {
      id: number
      email: string
      name?: string
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Optional authentication - doesn't fail if no token
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

      const decoded = jwt.verify(token, secret) as {
        id: number
        email: string
        name?: string
      }

      req.user = decoded
    }
    next()
  } catch (error) {
    // Silently fail for optional auth
    next()
  }
}
