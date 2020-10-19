const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

if (process.argv.length > 5) {
    console.log('too many arguments')
    console.log('if the name includes a space, add quotation marks around it')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://user:${password}@cluster0.7kaxo.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

//number is a String for now
const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('person', personSchema)

if (process.argv.length === 3) {
    console.log('phonebook:')

    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}

if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then(response => {
        console.log(`added ${response.name} ${response.number} to phonebook `)
        mongoose.connection.close()
    })
}