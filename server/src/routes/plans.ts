import { Router, Response } from 'express'
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth'
import db from '../config/database'

const router = Router()

/**
 * GET /api/plans
 * Get all plans for authenticated user
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    const [rows] = await db.query(
      `SELECT id, title, work_type, status, road_name, start_address,
              created_at, updated_at, confidence_score
       FROM plans
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    )

    res.json({ plans: rows })
  } catch (error) {
    console.error('Get plans error:', error)
    res.status(500).json({ error: 'Failed to fetch plans' })
  }
})

/**
 * GET /api/plans/:id
 * Get single plan by ID
 */
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const [rows] = await db.query(
      'SELECT * FROM plans WHERE id = ?',
      [id]
    )

    if (Array.isArray(rows) && rows.length > 0) {
      const plan = rows[0] as any

      // Check if user owns this plan (if authenticated)
      if (userId && plan.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // Log view activity
      if (userId) {
        await db.query(
          'INSERT INTO activity_log (user_id, plan_id, action_type, ip_address) VALUES (?, ?, ?, ?)',
          [userId, id, 'view', req.ip]
        )
      }

      res.json({ plan })
    } else {
      res.status(404).json({ error: 'Plan not found' })
    }
  } catch (error) {
    console.error('Get plan error:', error)
    res.status(500).json({ error: 'Failed to fetch plan' })
  }
})

/**
 * POST /api/plans
 * Create new plan (requires authentication)
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const {
      title,
      workType,
      roadData,
      workTiming,
      workZoneDetails,
      equipment,
      mutcdCalculations,
      confidenceScore,
      dataSources,
    } = req.body

    const [result] = await db.query(
      `INSERT INTO plans (
        user_id, title, work_type, road_name, start_address, end_address,
        latitude, longitude, speed_limit, lane_count, selected_lanes,
        work_zone_length_feet, duration_value, duration_unit, time_of_day,
        days_of_week, worker_count, has_flagger, flagger_count,
        equipment, mutcd_calculations, confidence_score, data_sources, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        workType,
        roadData.roadName,
        roadData.startAddress,
        roadData.endAddress,
        roadData.latitude || null,
        roadData.longitude || null,
        roadData.speedLimit,
        roadData.laneCount,
        JSON.stringify(roadData.selectedLanes),
        roadData.workZoneLengthFeet,
        workTiming.duration?.value,
        workTiming.duration?.unit,
        workTiming.timeOfDay,
        workTiming.daysOfWeek,
        workZoneDetails.workerCount,
        workZoneDetails.hasFlagger,
        workZoneDetails.flaggerCount || null,
        JSON.stringify(equipment),
        JSON.stringify(mutcdCalculations),
        confidenceScore || 100,
        JSON.stringify(dataSources || {}),
        'active',
      ]
    )

    const planId = (result as any).insertId

    // Log creation activity
    await db.query(
      'INSERT INTO activity_log (user_id, plan_id, action_type, ip_address) VALUES (?, ?, ?, ?)',
      [userId, planId, 'create', req.ip]
    )

    res.status(201).json({ planId, message: 'Plan created successfully' })
  } catch (error) {
    console.error('Create plan error:', error)
    res.status(500).json({ error: 'Failed to create plan' })
  }
})

/**
 * PUT /api/plans/:id
 * Update existing plan
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const updates = req.body

    // Check ownership
    const [rows] = await db.query(
      'SELECT user_id FROM plans WHERE id = ?',
      [id]
    )

    if (Array.isArray(rows) && rows.length > 0) {
      const plan = rows[0] as any
      if (plan.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' })
      }
    } else {
      return res.status(404).json({ error: 'Plan not found' })
    }

    // Update plan
    await db.query(
      `UPDATE plans SET
        title = COALESCE(?, title),
        status = COALESCE(?, status),
        updated_at = NOW()
       WHERE id = ?`,
      [updates.title, updates.status, id]
    )

    // Log edit activity
    await db.query(
      'INSERT INTO activity_log (user_id, plan_id, action_type, action_details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [userId, id, 'edit', JSON.stringify({ fields: Object.keys(updates) }), req.ip]
    )

    res.json({ message: 'Plan updated successfully' })
  } catch (error) {
    console.error('Update plan error:', error)
    res.status(500).json({ error: 'Failed to update plan' })
  }
})

/**
 * DELETE /api/plans/:id
 * Delete plan
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    // Check ownership
    const [rows] = await db.query(
      'SELECT user_id FROM plans WHERE id = ?',
      [id]
    )

    if (Array.isArray(rows) && rows.length > 0) {
      const plan = rows[0] as any
      if (plan.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' })
      }
    } else {
      return res.status(404).json({ error: 'Plan not found' })
    }

    // Delete plan
    await db.query('DELETE FROM plans WHERE id = ?', [id])

    res.json({ message: 'Plan deleted successfully' })
  } catch (error) {
    console.error('Delete plan error:', error)
    res.status(500).json({ error: 'Failed to delete plan' })
  }
})

/**
 * POST /api/plans/:id/export
 * Export plan as PDF (placeholder for now)
 */
router.post('/:id/export', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    // Log export activity
    if (userId) {
      await db.query(
        'INSERT INTO activity_log (user_id, plan_id, action_type, ip_address) VALUES (?, ?, ?, ?)',
        [userId, id, 'export', req.ip]
      )
    }

    res.json({ message: 'PDF export - Coming soon' })
  } catch (error) {
    console.error('Export plan error:', error)
    res.status(500).json({ error: 'Failed to export plan' })
  }
})

export default router
