import express from 'express'

import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getReviews, getReviewById, addReview, updateToy, removeReview, } from './review.controller.js'

export const reviewRoutes = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

// review routes
reviewRoutes.get('/', log, getReviews)
reviewRoutes.get('/:id', getReviewById)
reviewRoutes.post('/', requireAuth, requireAdmin, addReview)
// reviewRoutes.put('/', requireAuth, requireAdmin, updateReview)
reviewRoutes.delete('/', requireAuth, requireAdmin, removeReview)

