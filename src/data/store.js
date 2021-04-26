const { configureStore } = require('@reduxjs/toolkit')

const person = require('./slices/person')
const record = require('./slices/record')

const store = configureStore({
  reducer: {
    person: person.reducer,
    record: record.reducer
  }
})

module.exports = store
