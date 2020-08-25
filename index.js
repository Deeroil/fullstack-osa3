require('dotenv').config()
const express = require('express')
const { response } = require('express')
const Person = require('./models/person')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('body', function (req, res) {
  return JSON.stringify(res.body)
})

//TODO: yhdistä, ja body vaan jos POST
app.use(morgan('tiny'))
app.use(morgan('body'))

// :body ei toimi
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

app.get('/info', (req, res) => {
  res.send(
    `<div>Notebook has info for ${persons.length} people</div>
     <div>${new Date().toString()}</div>`
  )
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(result => {
    res.json(result)
    mongoose.connection.close()
  })
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

//should we check for used ids? maybe not
const generateId = () => {
  return Math.floor(Math.random() * Math.floor(5000))
}

const handleError = (res, statuscode, message) => {
  return res.status(statuscode).json({
    error: `${message}`
  })
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  //TODO? if both are missing, combine the message? 
  if (!body.name) {
    return handleError(res, 400, "name missing")
  }

  if (!body.number) {
    return handleError(res, 400, "number missing")
  }

  if (persons.find(p => p.name === body.name)) {
    return handleError(res, 400, "name must be unique")
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  }

  persons = persons.concat(person)

  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
