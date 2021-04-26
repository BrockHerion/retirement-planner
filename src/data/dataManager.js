const Person = require("../models/Person.js")
const fs = require('fs')
const store = require('./store')
const person = require('./slices/person')
const { loadPeople, addPerson } = person.actions

const path = 'data.json'

// load file
function loadFile() {

    if (fs.existsSync(path)) {
        let data = fs.readFileSync(path)
        let people = JSON.parse(data)
        store.dispatch(loadPeople(people))
        console.log("DONE LOADING FILE")

    } else {
        fs.writeFile(path, JSON.stringify([]), error => {
            if (error) throw error
            console.log("DONE CREATING FILE")
        })
    }
}

// save file
function saveFile() {
    const people = store.getState().persons
    let data = JSON.stringify(people)
    fs.writeFileSync(path, data, error => {
        if (error) throw error
        console.log("DONE SAVING FILE")
    })
}

module.exports = { loadFile, saveFile }