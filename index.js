require('dotenv').config()
const express = require('express')
const { response } = require('express')
const Person = require('./models/person')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', function (req, res) {
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

const handleContentError = (res, statuscode, message) => {
  return res.status(statuscode).json({
    error: `${message}`
  })
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  //TODO? if both are missing, combine the message? 
  if (!body.name) {
    return handleContentError(res, 400, "name missing")
  }

  if (!body.number) {
    return handleContentError(res, 400, "number missing")
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    res.json(savedPerson)
  })
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
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
    return res.status(400).send({ error: 'malformatted id' })   //!!!!!!!!!!!!!!!!!!!!!!!!!!!
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
