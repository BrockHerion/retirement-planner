/*
Functions used to calculate the financial components ofthe data set
*/

//Growth of the investment principal 
export function CompoundInterest(principal , rate, periods, years) {

	return principal *  ((1 + (rate/periods))**(periods * years));
}

//Growth of contributions to an investment
function FutureValueSeries(annual_contribution, rate, periods, years){

   return annual_contribution * ((((1 + (rate/periods))**(periods * years)) -1) / (rate/periods))
}
