import { loggerService } from '../../services/logger.service.js'
import { reviewService } from './review.service.js'

export async function getReviews(req, res) {
    try {
        const filterBy = {
            txt: req.query.txt || '',
            createdAt: +req.query.createdAt || '',
            createdBy: req.query.createdBy || '',
            toy: req.query.toy || 'all',
        }

        const reviews = await reviewService.query(filterBy)
        res.json(reviews)
    } catch (err) {
        loggerService.error('Failed to get reviews', err)
        res.status(500).send({ err: 'Failed to get reviews' })
    }
}

export async function getReviewById(req, res) {
    try {
        const reviewId = req.params.id
        const review = await reviewService.getById(reviewId)
        res.json(review)
    } catch (err) {
        loggerService.error('Failed to get review', err)
        res.status(500).send({ err: 'Failed to get review' })
    }
}

export async function addReview(req, res) {
    const { loggedinUser } = req
    try {
        const review = req.body
        review.createdBy = loggedinUser
        review.createdAt = Date.now()
        const addedReview = await reviewService.add(review)
        res.json(addedReview)
    } catch (err) {
        loggerService.error('Failed to add review', err)
        res.status(500).send({ err: 'Failed to add review' })
    }
}

export async function updateReview(req, res) {
    try {
        const review = req.body
        const updatedreview = await reviewService.update(review)
        res.json(updatedreview)
    } catch (err) {
        loggerService.error('Failed to update review', err)
        res.status(500).send({ err: 'Failed to update review' })
    }
}

export async function removeReview(req, res) {
    try {
        const reviewId = req.params.id
        await reviewService.remove(reviewId)
        res.send()
    } catch (err) {
        loggerService.error('Failed to remove review', err)
        res.status(500).send({ err: 'Failed to remove review' })
    }
}
