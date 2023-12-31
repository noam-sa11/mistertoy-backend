import { ObjectId } from 'mongodb'

import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { userService } from '../user/user.service.js'
import { toyService } from '../toy/toy.service.js'

export const reviewService = {
    query,
    getById,
    add,
    update,
    remove,
}

async function query(filterBy = {}) {
    try {
        const criteria = {}

        if (filterBy.txt) {
            criteria.txt = { $regex: filterBy.txt, $options: 'i' }
        }
        if (filterBy.createdAt) {
            criteria.createdAt = { $gte: new Date(filterBy.createdAt) };
        }
        if (filterBy.createdBy) {
            // Assuming createdBy is the user's ID
            const user = await userService.getById(filterBy.createdBy);
            if (user) {
                criteria.userId = user._id
            }
        }
        if (filterBy.toy) {
            criteria.toyId = filterBy.toy;
        }

        const sortOptions = {}
        if (filterBy.sortBy) {
            if (filterBy.sortBy === 'createdAt') {
                sortOptions.createdAt = 1 // 1 for ascending, -1 for descending
            } else if (filterBy.sortBy === 'createdBy') {
                sortOptions.createdBy = 1
            }
        }

        const collection = await dbService.getCollection('review')
        const reviews = await collection.find(criteria).sort(sortOptions).toArray()
        return reviews
    } catch (err) {
        loggerService.error('Cannot find reviews', err)
        throw err
    }
}

async function getById(reviewId) {
    try {
        const collection = await dbService.getCollection('review')
        const review = await collection.findOne({ _id: new ObjectId(reviewId) })
        return review
    } catch (err) {
        loggerService.error(`while finding review ${reviewId}`, err)
        throw err
    }
}

async function remove(reviewId) {
    try {
        const collection = await dbService.getCollection('review')
        await collection.deleteOne({ _id: new ObjectId(reviewId) })
    } catch (err) {
        loggerService.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}

async function add(review) {
    try {
        const collection = await dbService.getCollection('review')
        await collection.insertOne(review)
        return review
    } catch (err) {
        loggerService.error('cannot insert review', err)
        throw err
    }
}

async function update(review) {
    try {
        const reviewToUpdate = {
            name: review.name,
            price: review.price
        }
        const collection = await dbService.getCollection('review')
        await collection.updateOne({ _id: new ObjectId(review._id) }, { $set: reviewToUpdate })
        return review
    } catch (err) {
        loggerService.error(`cannot update review ${review._id}`, err)
        throw err
    }
}

async function addreviewMsg(reviewId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('review')
        await collection.updateOne({ _id: new ObjectId(reviewId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        loggerService.error(`cannot add review msg ${reviewId}`, err)
        throw err
    }
}

async function removereviewMsg(reviewId, msgId) {
    try {
        const collection = await dbService.getCollection('review')
        await collection.updateOne({ _id: new ObjectId(reviewId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        loggerService.error(`cannot add review msg ${reviewId}`, err)
        throw err
    }
}

async function addreviewReview(reviewId, review) {
    try {
        review.id = utilService.makeId()
        const collection = await dbService.getCollection('review')
        await collection.updateOne({ _id: new ObjectId(reviewId) }, { $push: { reviews: review } })
        return review
    } catch (err) {
        loggerService.error(`cannot add review review ${reviewId}`, err)
        throw err
    }
}

async function removereviewReview(reviewId, reviewId) {
    try {
        const collection = await dbService.getCollection('review')
        await collection.updateOne({ _id: new ObjectId(reviewId) }, { $pull: { reviews: { id: reviewId } } })
        return reviewId
    } catch (err) {
        loggerService.error(`cannot add review review ${reviewId}`, err)
        throw err
    }
}