const store = require('./data/store')
const record = require('./data/slices/record')
const { addRecord, clearRecords } = record.actions

function calculate(rateOfReturn, inflationRate, withdrawRate, yearsOfRetirement, personFilter, accountFilter){
  store.dispatch(
    clearRecords()
  )
  calculateModelData(rateOfReturn, inflationRate, withdrawRate, yearsOfRetirement, personFilter, accountFilter)
}

//Growth of the investment principal 
function compoundInterest(principal , rate, periods, years) {
  // console.log('CI',principal , rate, periods, years)

  return principal *  ((1 + (rate/periods))**(periods * years))
}

//Growth of contributions to an investment
function futureValueSeries(annual_contribution, rate, periods, years){
  // console.log('FV',annual_contribution, rate, periods, years)
  return (annual_contribution / periods) * ((((1 + (rate/periods))**(periods * years)) -1) / (rate/periods))
}

//Growth fuctions combined into preand post retirement accumulation in the balance
function accountGrowth(person_age, person_retirement_age, years, principal, annual_contribution, rate, periods){
  let balance = 0
  
  if ((person_age + years) < person_retirement_age) {
    balance = compoundInterest(principal , rate, periods, 1) + futureValueSeries(annual_contribution, rate, periods, 1)
  }else if ((person_age + years) >= person_retirement_age){
    balance = compoundInterest(principal , rate, periods, 1) 
  }
  return balance.toFixed(2)
}


//Income from Social Security
function socialSecurityIncome(person_age, person_retirement_age, years, person_start_SS_age, person_est_SS_benefit) {
  if ((person_age + years) <person_retirement_age){
    return 0
  }else if ((person_age + years) >= person_retirement_age){
    switch(person_start_SS_age){
    case 62:
      return person_est_SS_benefit * .70 * 12
    case 63:
      return person_est_SS_benefit * .75 * 12
    case 64:
      return person_est_SS_benefit * .80 * 12
    case 65:
      return person_est_SS_benefit * .867 * 12
    case 66:
      return person_est_SS_benefit * .933 * 12
    case 67:
      return (person_est_SS_benefit * 1.00 * 12)
    case 68:
      return person_est_SS_benefit * 1.08 * 12
    case 69:
      return person_est_SS_benefit * 1.16 * 12
    case 70:
      return person_est_SS_benefit * 1.24 * 12
    default:
      //error
      break
    }
  }    
}

//Determine the ammount of taxes due from taxable income 401k, IRA, Social Security, Investment accounts, Traditional Retirement accounts
function taxesDue(taxable_income, capital_gains) {
  let taxes = 0

  if (taxable_income <= 9875.00){
    taxes += (taxable_income * .1)
  }else if (taxable_income > 9875.00 && taxable_income <= 40125.00){
    taxes += ((taxable_income - 9875) * .12) + 987.50
  }else if (taxable_income > 40125.00 && taxable_income <= 85525.00){
    taxes += ((taxable_income - 40125) * .22) + 4617.50
  }else if (taxable_income > 85525.00 && taxable_income <= 163300.00){
    taxes += ((taxable_income - 85525) * .24) + 14605.50
  }else if (taxable_income > 163300.00 && taxable_income <= 207350){
    taxes += ((taxable_income - 163300) * .32) + 33271.50
  }else if (taxable_income > 207350.00 && taxable_income <= 518400.00){
    taxes += ((taxable_income - 207350) * .35) + 47367.50
  }else{
    taxes += ((taxable_income - 518400) * .37) + 156234.00
  }

  taxes += capital_gains * .15
  return taxes
}

//Inflation adjusted value of an asset
function inflationAdjustedValue(principal , inflation_rate, years){
  return principal *  ((1 - (inflation_rate))**(years))
}


//Determine the duration of the model
function getDuration(years){
  let duration = 0
  let retirementYears = years
  let people = store.getState().person.people

  for(let i = 0; i<people.length; i++){
    if((people[i].retirementAge - people[i].age) > duration){
      duration = people[i].retirementAge - people[i].age
    }
  }

  duration += parseFloat(retirementYears)
  return duration
}

//Calculate the amount withdrawn from an account
function withdraw(principal, withdrawRate){
  return principal * withdrawRate
}

//Calculate the net income 
function netIncome(ssBenefit, taxableIncome, nonTaxableIncome, capitalGains){
  return (ssBenefit + taxableIncome + nonTaxableIncome + capitalGains)
}

//Main routine to calculate the data for the model
function calculateModelData(rateOfReturn, inflationRate, withdrawRate, yearsOfRetirement, personFilter, accountFilter){
  //[filter logic]
  let periods = 12
  let duration = getDuration(yearsOfRetirement)
  let year = new Date().getFullYear()
  let traditional401k = 0
  let roth401k = 0
  let IRA = 0
  let rothIRA = 0
  let brokerage = 0
  let traditional401kPriorBalance = 0
  let roth401kPriorBalance = -1
  let iraPriorBalance = -1
  let rothIRAPriorBalance = -1
  let brokeragePriorBalance = -1
  let withdrawAmount = 0
  let totalWithdraws = 0
  let taxableWithdraws = 0
  let nonTaxableWithdraws = 0
  let capitalGainsWithdraws=0
  let ssIncome =0
  let net = 0
  let taxes = 0
  let gross = 0
  let inflationAdjustedIncome = 0
  let people = store.getState().person.people
  rateOfReturn = parseFloat(rateOfReturn/100)
  inflationRate = parseFloat(inflationRate/100)
  withdrawRate = parseFloat(withdrawRate/100)
  yearsOfRetirement = parseFloat(yearsOfRetirement)
  let sumTraditional401k = 0
  let sumRoth401k = 0
  let sumIRA = 0
  let sumRothIRA = 0
  let sumBrokerage = 0
  let map401kPriorBalances = new Map()
  let mapRoth401kPriorBalances = new Map()
  let mapIRAPriorBalances = new Map()
  let mapRothIRAPriorBalances = new Map()
  let mapBrokeragePriorBalances = new Map()

  //Loop for each year
  for(let i = 0; i < duration ; i++){
    const y = year++
        
    //Loop for each Person
    for(let p = 0; p < people.length ; p++){
      let evalAge = 0

      //Loop for each Account
      for(let a = 0; a < people[p].accounts.length ; a++){
        let contributions = 0
        switch(people[p].accounts[a].type){
        case '401k':
          
          //Set initial balance
          if(i== 0){
            map401kPriorBalances.set(p, parseFloat(people[p].accounts[a].balance))
          }
          
          //Three scenarios for contributions and withdraws based on age
          evalAge = parseFloat(people[p].age) + i
          if (evalAge < 50 ){
            contributions = parseFloat(people[p].accounts[a].annual_contribution)
              
            traditional401k = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, map401kPriorBalances.get(p), contributions, rateOfReturn, periods)
            map401kPriorBalances.set(p, parseFloat(traditional401k))
          }else if (evalAge >= 50 && evalAge < parseFloat(people[p].retirementAge)) {
            contributions = parseFloat(people[p].accounts[a].annual_contribution) + parseFloat(people[p].accounts[a].catchup_contribution)
                              
            traditional401k = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, map401kPriorBalances.get(p), contributions, rateOfReturn, periods)
            map401kPriorBalances.set(p, parseFloat(traditional401k))
          }else if (evalAge  >= parseFloat(people[p].retirementAge)){
            contributions = 0
                              
            traditional401k = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, map401kPriorBalances.get(p), contributions, rateOfReturn, periods)
            withdrawAmount += withdraw(traditional401k, withdrawRate)
            taxableWithdraws += withdrawAmount
            map401kPriorBalances.set(p, parseFloat(traditional401k - withdrawAmount))
          }
          sumTraditional401k += map401kPriorBalances.get(p)
          
          break
        case 'roth401k':
          //Set initial balance
          if(i== 0){
            mapRoth401kPriorBalances.set(p, parseFloat(people[p].accounts[a].balance))
          }
  
          //Three scenarios for contributions and withdraws based on age
          evalAge = parseFloat(people[p].age) + i
          if (evalAge < 50 ) {
            contributions = parseFloat(people[p].accounts[a].annual_contribution)
            
            roth401k = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, mapRoth401kPriorBalances.get(p), contributions, rateOfReturn, periods)
            mapRoth401kPriorBalances.set(p,parseFloat(roth401k))

          }else if (evalAge >= 50 && evalAge < parseFloat(people[p].retirementAge)) {
            contributions = parseFloat(people[p].accounts[a].annual_contribution) + parseFloat(people[p].accounts[a].catchup_contribution)
                              
            roth401k = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, mapRoth401kPriorBalances.get(p), contributions, rateOfReturn, periods)
            mapRoth401kPriorBalances.set(p, parseFloat(roth401k))
          }else if (evalAge >= parseFloat(people[p].retirementAge)){
            contributions = 0
                              
            roth401k = accountGrowth(people[p].age, people[p].retirementAge, i, mapRoth401kPriorBalances.get(p), contributions, rateOfReturn, periods)
            withdrawAmount += withdraw(roth401k, withdrawRate)
            nonTaxableWithdraws += withdrawAmount                   
            mapRoth401kPriorBalances.set(p,parseFloat(roth401k - withdrawAmount))
          }
          sumRoth401k += mapRoth401kPriorBalances.get(p)
          break
        case 'IRA':
          //Set initial balance
          if(i== 0){
            mapIRAPriorBalances.set(p, parseFloat(people[p].accounts[a].balance))
          }
  
          //Three scenarios for contributions and withdraws based on age
          evalAge = parseFloat(people[p].age) + i
          if (evalAge < 50 ) {
            contributions = parseFloat(people[p].accounts[a].annual_contribution)
  
            IRA = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, mapIRAPriorBalances.get(p), contributions, rateOfReturn, periods)
            mapIRAPriorBalances.set(p, parseFloat(IRA))
          }else if (evalAge >= 50 && evalAge < parseFloat(people[p].retirementAge)) {
            contributions = parseFloat(people[p].accounts[a].annual_contribution) + parseFloat(people[p].accounts[a].catchup_contribution)
                              
            IRA = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, mapIRAPriorBalances.get(p), contributions, rateOfReturn, periods)
            mapIRAPriorBalances.set(p, parseFloat(IRA))
          }else if (evalAge >= parseFloat(people[p].retirementAge)){
            contributions = 0
                              
            IRA = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, mapIRAPriorBalances.get(p), contributions, rateOfReturn, periods)
            withdrawAmount += withdraw(IRA, withdrawRate)
            taxableWithdraws += withdrawAmount
            mapIRAPriorBalances.set(p, parseFloat(IRA - withdrawAmount))
          }
          sumIRA += mapIRAPriorBalances.get(p)
          break
        case 'rothIRA':
          //Set initial balance
          if(i== 0){
            mapRothIRAPriorBalances.set(p, parseFloat(people[p].accounts[a].balance))
          }
  
          //Three scenarios for contributions and withdraws based on age
          evalAge = parseFloat(people[p].age) + i
          if (evalAge < 50 ) {
            contributions = parseFloat(people[p].accounts[a].annual_contribution)
  
            rothIRA = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, mapRothIRAPriorBalances.get(p), contributions, rateOfReturn, periods)
            mapRothIRAPriorBalances.set(p, parseFloat(rothIRA))
          }else if (evalAge >= 50 && evalAge < parseFloat(people[p].retirementAge)) {
            contributions = parseFloat(people[p].accounts[a].annual_contribution) + parseFloat(people[p].accounts[a].catchup_contribution)
                              
            rothIRA = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, mapRothIRAPriorBalances.get(p), contributions, rateOfReturn, periods)
            console.log(contributions, mapRothIRAPriorBalances.get(p), contributions, rateOfReturn, periods)
            mapRothIRAPriorBalances.set(p, parseFloat(rothIRA))
            
          }else if (evalAge >= people[p].retirementAge){
            contributions = 0
                              
            rothIRA = accountGrowth(people[p].age, people[p].retirementAge, i, mapRothIRAPriorBalances.get(p), contributions, rateOfReturn, periods)
            withdrawAmount += withdraw(rothIRA, withdrawRate)
            nonTaxableWithdraws += withdrawAmount
            mapRothIRAPriorBalances.set(p, parseFloat(rothIRA - withdrawAmount))
          }
          sumRothIRA += mapRothIRAPriorBalances.get(p)
          break
        case 'brokerage':
          //Set initial balance
          if(i== 0){
            mapBrokeragePriorBalances.set(p, parseFloat(people[p].accounts[a].balance))
          }
  
          //Two scenarios for contributions and withdraws based on age
          evalAge = parseFloat(people[p].age) + i
          if (evalAge < parseFloat(people[p].retirementAge) ) {
            contributions = parseFloat(people[p].accounts[a].annual_contribution) + parseFloat(people[p].accounts[a].catchup_contribution)
  
            brokerage = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, mapBrokeragePriorBalances.get(p), contributions, rateOfReturn, periods)
            mapBrokeragePriorBalances.set(p, parseFloat(brokerage))
          }else if (evalAge >= parseFloat(people[p].retirementAge)){
            contributions = 0
                              
            brokerage = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, mapBrokeragePriorBalances.get(p), contributions, rateOfReturn, periods)
            withdrawAmount += withdraw(brokerage, withdrawRate)
            capitalGainsWithdraws += withdrawAmount
            mapBrokeragePriorBalances.set(p, parseFloat(brokerage - withdrawAmount))
          }
          sumBrokerage += mapBrokeragePriorBalances.get(p)
          break
        default:
          //error
          break
        }
        //reset at loop end
        withdrawAmount=0

      }

      //Income calculations
      
      totalWithdraws = (taxableWithdraws + nonTaxableWithdraws + capitalGainsWithdraws)
      ssIncome = socialSecurityIncome(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, parseFloat(people[p].SSAge),parseFloat(people[p].estSSBenefits))
      net = netIncome(ssIncome, taxableWithdraws, nonTaxableWithdraws, capitalGainsWithdraws)
      taxes = taxesDue((taxableWithdraws + ssIncome), capitalGainsWithdraws)
      gross = (net - taxes)
      inflationAdjustedIncome = inflationAdjustedValue(gross, inflationRate, i)
    }
    
    


    //Add the Record to the dataset
    const newRecord = {
      year: y,
      traditional401k: parseFloat(sumTraditional401k).toFixed(2),
      roth401k: parseFloat(sumRoth401k).toFixed(2),
      IRA: parseFloat(sumIRA).toFixed(2),
      rothIRA: parseFloat(sumRothIRA).toFixed(2),
      brokerage: parseFloat(sumBrokerage).toFixed(2),
      withdraws: parseFloat(totalWithdraws).toFixed(2),
      ssIncome: parseFloat(ssIncome).toFixed(2),
      netIncome: parseFloat(net).toFixed(2),
      taxes: parseFloat(taxes).toFixed(2),
      grossIncome: parseFloat(gross).toFixed(2),
      inflationAdjustedIncome: parseFloat(inflationAdjustedIncome).toFixed(2)
    }

    store.dispatch(
      addRecord(newRecord)
    )

    //reset at loop end
    sumTraditional401k = 0
    sumRoth401k = 0
    sumIRA = 0
    sumRothIRA = 0
    sumBrokerage = 0
    taxableWithdraws = 0
    nonTaxableWithdraws = 0
    capitalGainsWithdraws = 0
  }


}



module.exports = { calculate }