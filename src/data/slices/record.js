const { createSlice } = require('@reduxjs/toolkit')

const record = createSlice({
  name: 'records',
  initialState: [],
  reducers: {
    setRecords: (_, {payload}) => payload,
    clearRecords: () => []
  }
})

module.exports = record