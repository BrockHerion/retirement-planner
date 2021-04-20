const financeFunctions = require('financeFunctions')


window.addEventListener('load', () => {
  
  var testFormControl = document.getElementById('testFormControl');

  testFormControl.addEventListener('keydown', e => {
    document.getElementById('testTextSection').innerHTML = testFormControl.value;
  })
})
