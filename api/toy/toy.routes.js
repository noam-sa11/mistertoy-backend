import express from 'express'

import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getToys, getToyById, addToy, updateToy, removeToy, addToyMsg, removeToyMsg, addToyReview, removeToyReview } from './toy.controller.js'

export const toyRoutes = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

// toy routes
toyRoutes.get('/', log, getToys)
toyRoutes.get('/:id', getToyById)
toyRoutes.post('/', requireAdmin, addToy)
toyRoutes.put('/', requireAdmin, updateToy)
toyRoutes.delete('/', requireAdmin, removeToy)

// msg routes
toyRoutes.post('/:id/msg', requireAuth, addToyMsg)
toyRoutes.delete('/:id/msg/:msgId', requireAuth, removeToyMsg)

// review routes
toyRoutes.post('/:id/review', requireAuth, addToyReview)
toyRoutes.delete('/:id/review/:msgId', requireAuth, removeToyReview)
