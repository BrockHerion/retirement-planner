const uuid=require('uuid')

class Account{
	
	Constructor(guipersonIDd, accountName, type, balance, annual_contribution, catchup_contribution){
		this.accountID = uuid.v4();
		this.accountOwner = personID;
        this.accountName = accountName;
		this.type = type;
		this.balance = balance;
		this.annual_contribution = annual_contribution;
		this.catchup_contribution = catchup_contribution;
	}
	
	
}

module.exports = Account;

