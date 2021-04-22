const store = require('../data/store')
const person = require('../data/slices/person')

const { addPerson } = person.actions

window.onload = () => {
  const testAddUserButton = document.getElementById('testAddPerson')
  const testTextSection = document.getElementById('testTextSection')

  testAddUserButton.addEventListener('click',  e => {
    e.preventDefault()
    console.log('Click!')
  
    store.dispatch(
      addPerson({message: 'Im in an object!'})
    )
    testTextSection.innerHTML = store.getState().persons.map(p => p.message)
  })
}
