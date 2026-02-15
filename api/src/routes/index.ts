import { Router } from 'express'
import apiRoutes from './api.routes.js'
import authRoutes from './auth.routes.js'
import botRoutes from './bot.routes.js'
import rankingRoutes from './ranking.routes.js'

const router = Router()

router.use('/api', apiRoutes)
// router.use('/auth', authRoutes)
router.use('/bot', botRoutes)
router.use('/ranking', rankingRoutes)

export default router