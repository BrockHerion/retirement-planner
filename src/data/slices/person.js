const { createSlice } = require('@reduxjs/toolkit')

const person = createSlice({
  name: 'person',
  initialState: {
    people: []
  },
  reducers: {
    addPerson: (state, {payload}) => {
      state.people = [...state.people, payload]
    },
    loadPeople: (state, {payload}) => {
      state.people = payload
    },
    addAccountToPerson: (state, {payload}) => {
      state.people = state.people.map(p => {
        if (p.id === payload.id) {
          return {
            ...payload.person,
            accounts: [...payload.person.accounts, payload.account]
          }
        }
        else {
          return p
        }
      })
    },
    deletePerson: (state, {payload}) => {
      state.people = state.people.filter(p => p.id !== payload.id)
    }
  }
})

module.exports = person



