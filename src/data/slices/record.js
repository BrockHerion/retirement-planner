const { createSlice } = require('@reduxjs/toolkit')

const record = createSlice({
  name: 'record',
  initialState: {
    records: []
  },
  reducers: {
    setRecords: (state, {payload}) => {
      state.records = payload
    },
    addRecord: (state, {payload}) => {
      state.records = [...state.records, payload]
    },
    clearRecords: (state) => {
      state.records = []
    }
  }
})

module.exports = record