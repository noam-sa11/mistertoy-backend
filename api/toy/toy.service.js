import { ObjectId } from 'mongodb'

import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg,
    addToyReview,
    removeToyReview
}

async function query(filterBy = {}) {
    try {
        const criteria = {}

        if (filterBy.name) {
            criteria.name = { $regex: filterBy.name, $options: 'i' }
        }
        if (filterBy.inStock !== 'all') {
            criteria.inStock = filterBy.inStock === 'true'
        }
        if (filterBy.maxPrice) {
            criteria.price = { $lte: Number(filterBy.maxPrice) }
        }
        if (filterBy.labels && filterBy.labels.length > 0) {
            criteria.labels = { $in: filterBy.labels }
        }

        const sortOptions = {}
        if (filterBy.sortBy) {
            if (filterBy.sortBy === 'name') {
                sortOptions.name = 1 // 1 for ascending, -1 for descending
            } else if (filterBy.sortBy === 'price') {
                sortOptions.price = 1
            } else {
                sortOptions.createdAt = 1
            }
        }

        const collection = await dbService.getCollection('toy')
        const toys = await collection.find(criteria).sort(sortOptions).toArray()
        return toys
    } catch (err) {
        loggerService.error('Cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = await collection.findOne({ _id: new ObjectId(toyId) })
        return toy
    } catch (err) {
        loggerService.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: new ObjectId(toyId) })
    } catch (err) {
        loggerService.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        loggerService.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToUpdate = {
            name: toy.name,
            price: toy.price
        }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toy._id) }, { $set: toyToUpdate })
        return toy
    } catch (err) {
        loggerService.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        loggerService.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        loggerService.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function addToyReview(toyId, review) {
    try {
        review.id = utilService.makeId()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $push: { reviews: review } })
        return review
    } catch (err) {
        loggerService.error(`cannot add toy review ${toyId}`, err)
        throw err
    }
}

async function removeToyReview(toyId, reviewId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $pull: { reviews: { id: reviewId } } })
        return reviewId
    } catch (err) {
        loggerService.error(`cannot add toy review ${toyId}`, err)
        throw err
    }
}