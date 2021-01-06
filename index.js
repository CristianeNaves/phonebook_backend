const express = require('express')
const app = express()

require('dotenv').config()

const Person = require('./models/person')
const cors = require('cors')

//const morgan = require('morgan')

const PORT = process.env.PORT

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

//morgan.token('body', (req, res) => {
//    return JSON.stringify(req.body)
//})

//app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
    .catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (body === undefined)
    return res.status(400).json({ error: 'Content Missing' })

  if (!body.name) {
    return res.status(400).json({
      error: 'name missing'
    })
  }

  if (!body.number) {
    return res.status(400).json({
      error: 'number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(result => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    res.json(result)
  })
    .catch(err => next(err))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person)
        return res.json(person)
      else
        return res.status(404).end()
    })
    .catch(err => next(err))
})
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(err => next(err))
})

app.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    res.send(`<p>Phonebook has info for ${persons.length} persons</p>
                <p>${new Date()}</p>`)
  })
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(err => next(err))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`)
})
