const fs = require('fs')
const store = require('./store')
const person = require('./slices/person')

const { loadPeople } = person.actions
const path = 'data.json'

// load file
function loadFile() {

  if (fs.existsSync(path)) {
    let data = fs.readFileSync(path)
    let people = JSON.parse(data)
    store.dispatch(loadPeople(people))


  } else {
    fs.writeFile(path, JSON.stringify([]), error => {
      if (error) throw error

    })
  }
}

// save file
function saveFile() {

  const people = store.getState().person.people
  const data = JSON.stringify(people)
  console.log(people)
  fs.writeFileSync(path, data, error => {
    if (error) throw error

  })
}

module.exports = { loadFile, saveFile }