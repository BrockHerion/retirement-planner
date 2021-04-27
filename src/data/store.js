const { configureStore } = require('@reduxjs/toolkit')
const storage = require('redux-persist/lib/storage')
const { combineReducers } = require('redux')
const { persistReducer } = require('redux-persist')

const person = require('./slices/person')
const record = require('./slices/record')

const reducers = combineReducers({
  person: person.reducer,
  record: record.reducer
})

const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(persistConfig, reducers)

const store = configureStore({
  reducer: persistedReducer,
})

module.exports = store
