const store = require('../data/store')
const person = require('../data/slices/person')
const uuid = require('uuid')

// const { 
//   getRoR, 
//   getInflationRate, 
//   getWithdrawRate, 
//   getYearsOfRetirement, 
//   getOutputType, 
//   getPersonFilter, 
//   getAccountFilter } = require('../finance_functions')


const { addPerson } = person.actions

window.addEventListener('load',  () => {

  const calculateButton = document.getElementById('btn_calculate')
  document.getElementById('inputRoR').value = 7
  document.getElementById('inputInflationRate').value = 2.5
  document.getElementById('inputWithdrawRate').value = 4
  document.getElementById('inputYearsOfRetirement').value = 30

  calculateButton.addEventListener('click',  e => {
    e.preventDefault()

    // const rateOfReturn = document.getElementById('inputRoR').value
    // const inflationRate = document.getElementById('inputInflationRate').value
    // const withdrawRate = document.getElementById('inputWithdrawRate').value
    // const yearsOfRetirement = document.getElementById('inputYearsOfRetirement').value
    // const outputType = document.getElementById('outputType').value
    // const personFilter = document.getElementById('personFilter').value
    // const accountFilter = document.getElementById('accountFilter').value

    // getRoR(rateOfReturn)
    // getInflationRate(inflationRate)
    // getWithdrawRate(withdrawRate)
    // getYearsOfRetirement(yearsOfRetirement)
    // getOutputType(outputType)
    // getPersonFilter(personFilter)
    // getAccountFilter(accountFilter)
  })

  const addEditPersonForm = document.getElementById('addEditPersonForm')

  addEditPersonForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const formData = new FormData(addEditPersonForm)
    const person = {
      id: uuid.v4(),
      name: formData.get('name'),
      age: formData.get('age'),
      retirementAge: formData.get('retirementAge'),
      estSSBenefits: formData.get('estSSBenefits'),
      SSAge: formData.get('SSAge'),
      accounts: []
    }

    store.dispatch(
      addPerson(person)
    )
    
    bindPersonsGrid()
  })
})

const bindPersonsGrid = () => {
  const tableBody = document.getElementById('personTable').getElementsByTagName('tbody')[0]

  tableBody.innerHTML = ''

  store.getState().person.people.map(p => {
    const row = tableBody.insertRow()

    row.innerHTML = `
      <td>${p.name}</td>
      <td>${p.accounts.length}</td>
      <td>
        <button id='edit-${p.id}' class="btn btn-link">
          <i class="ri-edit-fill"></i>
        </button>
      </td>
      <td>
        <button id='delete-${p.id}' class="btn btn-link">
          <i class="ri-close-circle-line"></i>
        </button>
      </td>
    `
  })
}
