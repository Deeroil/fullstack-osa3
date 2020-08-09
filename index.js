const express = require('express')
const { response } = require('express')
const app = express()

//tän unohdin!
app.use(express.json())

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
  res.json(persons)
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
  //console.log('body ', body)

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

  //console.log('person ', person)
  persons = persons.concat(person)

  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
})

const port = 3001
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
