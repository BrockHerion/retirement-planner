const financeFunctions = require('finance_functions')


window.addEventListener('load', () => {
  
  var testFormControl = document.getElementById('testFormControl');

  testFormControl.addEventListener('keydown', e => {
    document.getElementById('testTextSection').innerHTML = testFormControl.value;
  })
})
