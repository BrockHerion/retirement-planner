const { configureStore } = require('@reduxjs/toolkit')

const person = require('./slices/person')
const record = require('./slices/record')

const store = configureStore({
  reducer: {
    persons: person.reducer,
    records: record.reducer
  }
})

module.exports = store
