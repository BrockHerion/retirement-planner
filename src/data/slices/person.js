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
    }
  }
})

module.exports = person



