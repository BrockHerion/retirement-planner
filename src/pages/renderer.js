const store = require('../data/store')
const person = require('../data/slices/person')
const record = require('../data/slices/record')
const uuid = require('uuid')
const { saveFile, loadFile } = require('../data/dataManager')
const { calculate } = require('../finance_functions')

const { 
  getRoR, 
  getInflationRate, 
  getWithdrawRate, 
  getOutputType, 
  getPersonFilter, 
  getAccountFilter } = require('../finance_functions')


const { addPerson, addAccountToPerson, deletePerson } = person.actions

window.addEventListener('load',  () => {

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
    const personFilter = document.getElementById('personFilter').value
    const accountFilter = document.getElementById('accountFilter').value

    //load file for testing
    loadFile()
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
    
    bindData()

    addEditPersonForm.reset()
  })

  const addEditAccountForm = document.getElementById('addEditAccountForm')

  addEditAccountForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const selectedPersonId = document.getElementById('selectPerson').value
    const person = store.getState().person.people.find(p => p.id === selectedPersonId)

    const formData = new FormData(addEditAccountForm)
    const accountType = document.getElementById('selectAccountType')

    const account = {
      id: uuid.v4(),
      type: accountType.value,
      balance: formData.get('balance'),
      annual_contribution: formData.get('annualContrib'),
      catchup_contributuon: formData.get('catchupContrib')
    }

    store.dispatch(
      addAccountToPerson({id: selectedPersonId, person: person, account: account})
    )

    saveFile()
    bindData()

    addEditAccountForm.reset()
  })

  bindData()
})

const bindData = () => {
  bindPersonsGrid()
  bindAddAccountPersonSelector()
}

const deletePersonFromTable = (e) => {
  e.preventDefault()
  
  const personId = e.target.getAttribute('data-person-id')
  store.dispatch(
    deletePerson({id: personId})
  )

  bindData()
}

const bindPersonsGrid = () => {
  const tableBody = document.getElementById('personTable').getElementsByTagName('tbody')[0]

  tableBody.innerHTML = ''

  store.getState().person.people.map(p => {
    const row = tableBody.insertRow()

    row.innerHTML = `
      <td>${p.name}</td>
      <td>${p.accounts.length}</td>
      <td>
        <button 
          id='delete-${p.id}'
          class="btn btn-link" 
          data-person-id='${p.id}'>
          <i class="ri-close-circle-line"></i>
        </button>
      </td>
    `

    const rowButton = document.getElementById(`delete-${p.id}`)
    rowButton.addEventListener('click', deletePersonFromTable)
  })
}


const bindAddAccountPersonSelector = () => {
  const selector = document.getElementById('selectPerson')

  selector.innerHTML = ''

  store.getState().person.people.map(p => {
    const option = document.createElement('option')
    option.value = p.id
    option.textContent = p.name
    selector.appendChild(option)
  })
}

const bindRecordsGrid = () => {
  const tableBody = document.getElementById('recordsTable').getElementsByTagName('tbody')[0]

  tableBody.innerHTML = ''

  store.getState().record.records.map(r => {
      const row = tableBody.insertRow()

    row.innerHTML = `
      <td>${r.year}</td>
      <td>${r.traditional401k}</td>
      <td>${r.roth401k}</td>
      <td>${r.IRA}</td>
      <td>${r.rothIRA}</td>
      <td>${r.brokerage}</td>
      <td>${r.withdraws}</td>
      <td>${r.ssIncome}</td>
      <td>${r.netIncome}</td>
      <td>${r.taxes}</td>
      <td>${r.grossIncome}</td>
      <td>${r.inflationAdjustedIncome}</td>
    `