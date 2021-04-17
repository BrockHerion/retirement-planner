const { configureStore } = require('@reduxjs/toolkit')

const person = require('./slices/person')

const store = configureStore({
  reducer: {
    persons: person.reducer,
  }
})

console.log(`Initial State: ${store.getState()}`)

module.exports = store
