const uuid=require('uuid')

class Person{
	
	Constructor(name, age, retirementAge, estSSBenefits, SSAge){
		this.personID = uuid.v4();
		this.name = name;
		this.age = age;
		this.retirementAge = retirementAge;
		this.estSSBenefits = estSSBenefits;
		this.SSAge = SSAge;
		this.accounts = [];
	}
	
	createAccount(accountName, type, balance, annual_contribution, catchup_contribution){
		const acc = new Account(this.personID, accountName, type, balance, annual_contribution, catchup_contribution);
		this.accounts.push(acc);
	}

    getAccounts(){

    }
}

module.exports = Person;