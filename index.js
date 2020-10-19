require('dotenv').config()
const express = require('express')
const Person = require('./models/person')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', function (req) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/info', (req, res, next) => {
    Person.countDocuments()
        .then(result => {
            res.send(
                `<div>Phonebook has info for ${result} people</div>
       <div>${new Date().toString()}</div>`)
        })
        .catch(error => next(error))
})

app.get('/api/persons', (req, res, next) => {
    Person.find({})
        .then(result => {
            res.json(result)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

const handleMissingContent = (person, res) => {
    if (!person.name && !person.number) {
        return handleContentError(res, 400, 'name and number missing')
    }

    if (!person.name) {
        return handleContentError(res, 400, 'name missing')
    }

    if (!person.number) {
        return handleContentError(res, 400, 'number missing')
    }
}

const handleContentError = (res, statuscode, message) => {
    return res.status(statuscode).json({
        error: `${message}`
    })
}

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    if (!body.name || !body.number) {
        return handleMissingContent(body, res)
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    //FIX: 'NAME was already deleted from the server' when can't update because of missing content. => create a new 'message' for this
    if (!person.name || !person.number) {
        return handleMissingContent(person, res)
    }

    //TODO: find out why runValidators breaks update
    Person.findByIdAndUpdate(req.params.id, person, { new: true }/*, {runValidators: true}*/)
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(error => {
            console.log('error in removing')
            next(error)
        })
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.log(error)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
