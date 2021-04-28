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


const { addPerson } = person.actions
const { addRecord } = record.actions

window.addEventListener('load',  () => {

  const calculateButton = document.getElementById('btn_calculate')
  document.getElementById('inputRoR').value = 7
  document.getElementById('inputInflationRate').value = 2.5
  document.getElementById('inputWithdrawRate').value = 4
  document.getElementById('inputYearsOfRetirement').value = 5

  calculateButton.addEventListener('click',  e => {
    e.preventDefault()

    const rateOfReturn = document.getElementById('inputRoR').value
    const inflationRate = document.getElementById('inputInflationRate').value
    const withdrawRate = document.getElementById('inputWithdrawRate').value
    const yearsOfRetirement = document.getElementById('inputYearsOfRetirement').value
    const personFilter = document.getElementById('personFilter').value
    const accountFilter = document.getElementById('accountFilter').value

    loadFile()
    calculate(rateOfReturn, inflationRate, withdrawRate, yearsOfRetirement, personFilter, accountFilter)
    

    //test record output
    // for (i=0; i <5; i++){
    //   let newRecord = {
    //     year: 2021 + i,
    //     traditional401k: 1000 * i,
    //     roth401k: 1000 * i,
    //     IRA: 1000 * i,
    //     rothIRA: 1000 * i,
    //     brokerage: 1000 * i,
    //     withdraws: 1000 * i,
    //     ssIncome: 1000 * i,
    //     netIncome: 1000 * i,
    //     taxes: 1000 * i,
    //     grossIncome: 1000 * i,
    //     inflationAdjustedIncome: 1000 * i
    //   }

    //   store.dispatch(
    //     addRecord(newRecord)
    //   )
    // }
    bindRecordsGrid()

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
  })
}
