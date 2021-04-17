const Person = require("../models/Person.js")

function addPerson(name, age, retirementAge, estSSBenefits, SSAge) {

    let newPerson = new Person(name, age, retirementAge, estSSBenefits, SSAge)

}