class Record{
	constructor(year, person, traditional401k, roth401k, IRA, rothIRA, brokerageAccount, withdraw, ssIncome, netIncome, taxesDue, grossIncome, inflationAdjustedGrossIncome){
        this.year = year; 
        this.person = person;
        this.traditional401k = traditional401k; 
        this.roth401k = roth401k;
        this.IRA = IRA;
        this.rothIRA = rothIRA;
        this.brokerageAccount = brokerageAccount;
        this.withdraw = withdraw;
        this.ssIncome = ssIncome;
        this.netIncome = netIncome;
        this.taxesDue = taxesDue; 
        this.grossIncome = grossIncome;
        this.inflationAdjustedGrossIncome = inflationAdjustedGrossIncome;
    }
}

module.exports = Record;

