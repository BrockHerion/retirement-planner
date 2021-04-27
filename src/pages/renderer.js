const store = require('../data/store')
const person = require('../data/slices/person')
const uuid = require('uuid')
const { saveFile } = require('../data/dataManager')
const { calculate } = require('../finance_functions')

const { 
  getRoR, 
  getInflationRate, 
  getWithdrawRate, 
  getOutputType, 
  getPersonFilter, 
  getAccountFilter } = require('../finance_functions')


const { addPerson } = person.actions

window.addEventListener('load',  () => {

  const calculateButton = document.getElementById('btn_calculate')
  document.getElementById('inputRoR').value = 7
  document.getElementById('inputInflationRate').value = 2.5
  document.getElementById('inputWithdrawRate').value = 4
  document.getElementById('inputYearsOfRetirement').value = 30

  calculateButton.addEventListener('click',  e => {
    e.preventDefault()
    let P = store.getState().person.people
    // console.log(P.length)
    // store.getState().person.people.map(p => {
    // console.log(p.name)
    // })
    const rateOfReturn = document.getElementById('inputRoR').value
    const inflationRate = document.getElementById('inputInflationRate').value
    const withdrawRate = document.getElementById('inputWithdrawRate').value
    const yearsOfRetirement = document.getElementById('inputYearsOfRetirement').value
    const personFilter = document.getElementById('personFilter').value
    const accountFilter = document.getElementById('accountFilter').value
    // const outputType = document.getElementById('outputType').value

    calculate(rateOfReturn, inflationRate, withdrawRate, yearsOfRetirement, personFilter, accountFilter)
  })

  const addEditPersonForm = document.getElementById('addEditPersonForm')

  addEditPersonForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const formData = new FormData(addEditPersonForm)
    const newPerson = {
      id: uuid.v4().toString(),
      name: formData.get('name'),
      age: formData.get('age'),
      retirementAge: formData.get('retirementAge'),
      estSSBenefits: formData.get('estSSBenefits'),
      SSAge: formData.get('SSAge'),
      accounts: []
    }

    store.dispatch(
      addPerson(newPerson)
    )
    saveFile()
    bindPersonsGrid()

    addEditPersonForm.reset()
  })

  bindPersonsGrid()
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
