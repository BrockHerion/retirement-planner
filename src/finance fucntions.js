/*
Functions used to calculate the financial components ofthe data set
*/

//Growth of the investment principal 
export function CompoundInterest(principal , rate, periods, years) {

	return principal *  ((1 + (rate/periods))**(periods * years));
}

//Growth of contributions to an investment
export function FutureValueSeries(annual_contribution, rate, periods, years){

   return annual_contribution * ((((1 + (rate/periods))**(periods * years)) -1) / (rate/periods))
}


//Growth of a retirement account with age based contribution restrictions (410k, Roth 401k, IRA, Roth IRA)
export function retirementAccountGrowth(person_age, person_retirement_age, principal, annual_contribution, catchup_contribution, rate, periods, years, withdraw_rate){

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

    } else {
        //error case
    }
}