const { createSlice } = require('@reduxjs/toolkit')

const person = createSlice({
  name: 'persons',
  initialState: [],
  reducers: {
    addPerson: (state, {payload}) => [...state, payload],
    loadPeople: (_, {payload}) => payload
  }
})

module.exports = person