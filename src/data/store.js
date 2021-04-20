const { configureStore } = require('@reduxjs/toolkit')

const person = require('./slices/person')

const store = configureStore({
  reducer: {
    persons: person.reducer,
  }
})

module.exports = store
