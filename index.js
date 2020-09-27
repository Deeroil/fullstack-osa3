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

//for testing
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
    //TODO: Fix this to count from Mongo
    `<div>Notebook has info for ${persons.length} people</div>
     <div>${new Date().toString()}</div>`
  )
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  }).catch(error => {
    console.log(error)
    res.status(400).send({ error: 'malformatted id' })
  })
})

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

  //TODO: remove later
  // if (persons.find(p => p.name === body.name)) {
  //   return handleError(res, 400, "name must be unique")
  // }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    res.json(savedPerson)
  })
})

//Fixaa viel
app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  Person.findByIdAndRemove(id).then(res.status(204).end())
  .catch(error => {
    console.log('error in removing')
  })
  
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
