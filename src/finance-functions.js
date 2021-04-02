/*
Functions used to calculate the financial components ofthe data set
*/

//Growth of the investment principal 
function compoundInterest(principal , rate, periods, years) {

	return principal *  ((1 + (rate/periods))**(periods * years))
}

//Growth of contributions to an investment
function futureValueSeries(annual_contribution, rate, periods, years){

   return annual_contribution * ((((1 + (rate/periods))**(periods * years)) -1) / (rate/periods))
}


//Growth of a retirement account with age based contribution restrictions (410k, Roth 401k, IRA, Roth IRA)
function retirementAccountGrowth(person_age, person_retirement_age, principal, annual_contribution, catchup_contribution, rate, periods, years, withdraw_rate){

    if (person_age < 50) {
        //Contributions without catchup contributions
        //No withdraws

        let contributions = annual_contribution
        return (CompoundInterest(principal , rate, periods, years) + FutureValueSeries(contributions, rate, periods, years))

    } else if (person_age >= 50 && person_age < person_retirement_age) {
        //Contributions with catchup contributions
        //No withdraws

        let contributions = annual_contribution + catchup_contribution
        return (CompoundInterest(principal , rate, periods, years) + FutureValueSeries(contributions, rate, periods, years))

    } else if (person_age >= person_retirement_age){
        //No further contributions
        //withdraws reduce the amount

        return (CompoundInterest(principal , rate, periods, years) - (principal * withdraw_rate))
    } 
}


//Growth of an investment account (brokerage account)
function investmentAccountGrowth(person_age, person_retirement_age, principal, annual_contribution, rate, periods, years, withdraw_rate){

    if (person_age <person_retirement_age) {
        //Contributions without withdraws

        return (CompoundInterest(principal , rate, periods, years) + FutureValueSeries(annual_contribution, rate, periods, years))

    } else if (person_age >= person_retirement_age){
        //No further contributions with withdraws

        return (CompoundInterest(principal , rate, periods, years) - (principal * withdraw_rate))
    } 
}

//Income from Social Security
function socialSecurityIncome(person_start_SS_age, person_est_SS_benefit) {
    switch(person_start_SS_age){
        case 62:
            return person_est_SS_benefit * .70
        case 63:
            return person_est_SS_benefit * .75
        case 64:
            return person_est_SS_benefit * .80
        case 65:
            return person_est_SS_benefit * .867
        case 66:
            return person_est_SS_benefit * .933
        case 67:
            return person_est_SS_benefit * .100
        case 68:
            return person_est_SS_benefit * .108
        case 69:
            return person_est_SS_benefit * .116
        case 70:
            return person_est_SS_benefit * .124
        default:
            //error
            break;
    }
}

//Determine the ammount of taxes due from taxable income 401k, IRA, Social Security, Investment accounts, Traditional Retirement accounts
function taxesDue(taxable_income, captital_gains) {
    let taxes = 0
    taxes += capital_gains * .20

    switch(taxable_income){
        case (taxable_income <= 9875.00):
            taxes +=  taxable_income * .1
            break;
        case (taxable_income > 9875.00 && taxable_income <= 40125.00):
            taxes +=  taxable_income * .12 + 987.50
            break;
        case (taxable_income > 40125.00 && taxable_income <= 85525.00):
            taxes +=  taxable_income * .22 + 4617.50
            break;
        case (taxable_income > 85525.00 && taxable_income <= 163300.00):
            taxes +=  taxable_income * .24 + 14605.50
            break;
        case (taxable_income > 163300.00 && taxable_income <= 207350):
            taxes +=  taxable_income * .32 + 33271.50   
            break;
        case (taxable_income > 207350.00 && taxable_income <= 518400.00):
            taxes +=  taxable_income * .35 + 47367.50 
            break;
        case (taxable_income > 518400.00):
            taxes +=  taxable_income * .37 + 156234.00    
            break;
        default:
            //error
            break;                  
    }
    return taxes
}

//Inflation adjusted value of an asset
function inflationAdjustedValue(principal , inflation_rate, years){

	return principal *  ((1 - (rate))**(years))
}

module.exports = { compoundInterest, futureValueSeries, retirementAccountGrowth, investmentAccountGrowth, socialSecurityIncome, taxesDue, inflationAdjustedValue };