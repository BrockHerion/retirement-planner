/*
Functions used to calculate the financial components ofthe data set
*/

export function CompoundInterest(principal , rate, periods, years) {

	return principal *  ((1 + (rate/periods))**(periods * years));
}