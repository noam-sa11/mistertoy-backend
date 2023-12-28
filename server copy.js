import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { toyService } from './services/toy.service.js'
import { userService } from './services/user.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

// Express Config:
const corsOptions = {
    origin: [
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
    ],
    credentials: true
}
app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


// REST API for toys

// toy LIST
app.get('/api/toy', async (req, res) => {
    // console.log('req:', req.query)
    try {
        const filterBy = {
            name: req.query.name || '',
            maxPrice: +req.query.maxPrice || Infinity,
            inStock: req.query.inStock || 'all',
            labels: req.query.labels || [],
            sortBy: req.query.sortBy || 'name',
        }

        const toys = await toyService.query(filterBy)
        res.send(toys)
    } catch (error) {
        loggerService.error('Cannot get toys', error)
        res.status(400).send('Cannot get toys')
    }
})

// toy READ
app.get('/api/toy/:toyId', async (req, res) => {
    try {
        const { toyId } = req.params
        const toy = await toyService.getById(toyId)
        res.send(toy)
    } catch (error) {
        loggerService.error('Cannot get toy', error)
        res.status(400).send('Cannot get toy')
    }
})

// toy CREATE
app.post('/api/toy', async (req, res) => {
    try {
        const toy = {
            name: req.body.name,
            price: +req.body.price,
            labels: req.body.labels,
            inStock: req.body.inStock,
            createdAt: req.body.createdAt,
        }

        const savedToy = await toyService.save(toy)
        res.send(savedToy)
    } catch (error) {
        loggerService.error('Cannot save toy', error)
        res.status(400).send('Cannot save toy')
    }
})

// toy UPDATE
app.put('/api/toy/:toyId', async (req, res) => {
    // const loggedinUser = userService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Cannot update toy')
    try {
        const toy = {
            _id: req.body._id,
            name: req.body.name,
            price: +req.body.price,
            // labels: req.body.labels,
        }

        const savedToy = await toyService.save(toy)
        res.send(savedToy)
    } catch (error) {
        loggerService.error('Cannot save toy', error)
        res.status(400).send('Cannot save toy')
    }

})

// toy DELETE
app.delete('/api/toy/:toyId', async (req, res) => {
    try {
        const { toyId } = req.params
        await toyService.remove(toyId)
        loggerService.info(`Toy ${toyId} removed`)
        res.send('Removed!')
    } catch (error) {
        loggerService.error('Cannot remove toy', error)
        res.status(400).send('Cannot remove toy')
    }
})


// AUTH API
app.get('/api/user', async (req, res) => {
    try {
        const users = await userService.query()
        res.send(users)
    } catch (error) {
        loggerService.error('Cannot load users', error)
        res.status(400).send('Cannot load users')
    }
})

app.post('/api/auth/login', async (req, res) => {
    try {
        const credentials = req.body
        const user = await userService.checkLogin(credentials)

        if (user) {
            const loginToken = userService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        } else {
            loggerService.info('Invalid Credentials', credentials)
            res.status(401).send('Invalid Credentials')
        }
    } catch (error) {
        loggerService.error('Error during login', error)
        res.status(500).send('Internal Server Error')
    }
})

app.post('/api/auth/signup', async (req, res) => {
    try {
        const credentials = req.body
        const user = await userService.save(credentials)

        if (user) {
            const loginToken = userService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        } else {
            loggerService.info('Cannot signup', credentials)
            res.status(400).send('Cannot signup')
        }
    } catch (error) {
        loggerService.error('Error during signup', error)
        res.status(500).send('Internal Server Error')
    }
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})


app.put('/api/user', async (req, res) => {
    try {
        const loggedinUser = userService.validateToken(req.cookies.loginToken)

        if (!loggedinUser) return res.status(400).send('No logged in user')

        const { diff } = req.body

        if (loggedinUser.score + diff < 0) return res.status(400).send('No credit')

        loggedinUser.score += diff
        const user = await userService.save(loggedinUser)

        const token = userService.getLoginToken(user)
        res.cookie('loginToken', token)
        res.send(user)
    } catch (error) {
        loggerService.error('Error updating user', error)
        res.status(500).send('Internal Server Error')
    }
})


app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const PORT = process.env.PORT || 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
