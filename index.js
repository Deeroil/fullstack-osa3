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
  return JSON.stringify(res.body)
})

// :body ei toimi kun post
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//TODO: yhdistä, ja body vaan jos POST, vai osaako se ite skippaa ei oo body?
app.use(morgan('tiny'))
app.use(morgan('body'))

//aa ei se toimi näin :D
// morgan.format('tinyAndBody', ':tiny :body')
// app.use(morgan('tinyAndBody'))

app.get('/info', (req, res) => {
  Person.countDocuments().then(result => {
    res.send(
      `<div>Phonebook has info for ${result} people</div>
       <div>${new Date().toString()}</div>`)
  })
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

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    res.json(savedPerson)
  })
})

app.delete('/api/persons/:id', (req, res) => {
  Person.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(204).end()
  })
  .catch(error => {
    console.log(error)
    console.log('error in removing')
  })
  
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
