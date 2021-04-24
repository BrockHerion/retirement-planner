const store = require('../data/store')
const person = require('../data/slices/person')
const Person = require('../models/Person')

const { testPeeps, getRoR, getInflationRate, getWithdrawRate, getYearsOfRetirement, 
        getOutputType, getPersonFilter, getAccountFilter } = require('../finance_functions')


const { addPerson } = person.actions

window.onload = () => {
  const testAddUserButton = document.getElementById('testAddPerson')
  const testTextSection = document.getElementById('testTextSection')

  testAddUserButton.addEventListener('click',  e => {
    e.preventDefault()
    console.log('Click!')
  
    const p1 = new Person('Albert', 40, 65, 2500, 65)
    const p1s = JSON.stringify(p1)

    store.dispatch(
      addPerson(p1s)
    )
    testTextSection.innerHTML = store.getState().persons.map(p => p.message)
  })

  const calculateButton = document.getElementById('btn_calculate')
  document.getElementById('inputRoR').value = 7
  document.getElementById('inputInflationRate').value = 2.5
  document.getElementById('inputWithdrawRate').value = 4
  document.getElementById('inputYearsOfRetirement').value = 30

  calculateButton.addEventListener('click',  e => {
    e.preventDefault()

    const rateOfReturn = document.getElementById('inputRoR').value
    const inflationRate = document.getElementById('inputInflationRate').value
    const withdrawRate = document.getElementById('inputWithdrawRate').value
    const yearsOfRetirement = document.getElementById('inputYearsOfRetirement').value
    const outputType = document.getElementById('outputType').value
    const personFilter = document.getElementById('personFilter').value
    const accountFilter = document.getElementById('accountFilter').value

    getRoR(rateOfReturn)
    getInflationRate(inflationRate)
    getWithdrawRate(withdrawRate)
    getYearsOfRetirement(yearsOfRetirement)
    getOutputType(outputType)
    getPersonFilter(personFilter)
    getAccountFilter(accountFilter)
  })

}
