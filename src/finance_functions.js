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
  return principal *  ((1 + (rate/periods))**(periods * years))
}

//Growth of parseFloat(contributions) to an investment
function futureValueSeries(annual_contribution, rate, periods, years){
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
  let traditional401kPriorBalance = -1
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

  let people = []
  if (personFilter === 'all') {
    people = store.getState().person.people
  }
  else {
    people = store.getState().person.people.filter(p => p.id === personFilter)
  }

  rateOfReturn = parseFloat(rateOfReturn/100)
  inflationRate = parseFloat(inflationRate/100)
  withdrawRate = parseFloat(withdrawRate/100)
  yearsOfRetirement = parseFloat(yearsOfRetirement)


  //Loop for each year
  for(let i = 0; i < duration ; i++){
    const y = year++
    
    //Loop for each Person
    for(let p = 0; p < people.length ; p++){
      let evalAge = 0

      let accounts = []
      if (accountFilter === 'all') {
        accounts = people[p].accounts
      } else {
        accounts = people[p].accounts.filter(a => a.name === accountFilter)
      }

      //Loop for each Account
      for(let a = 0; a < accounts.length ; a++){
        let contributions = 0
        switch(people[p].accounts[a].type){
        case '401k':
          //Set initial balance
          if(traditional401kPriorBalance < 0){
            traditional401kPriorBalance = parseFloat(people[p].accounts[a].balance)
          }
            
          //Three scenarios for contributions and withdraws based on age
          evalAge = parseFloat(people[p].age) + i
          if (evalAge < 50 ){
            contributions = parseFloat(people[p].accounts[a].annual_contribution)
              
            traditional401k = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, traditional401kPriorBalance, contributions, rateOfReturn, periods)
            traditional401kPriorBalance = parseFloat(traditional401k)

          }else if (evalAge >= 50 && evalAge < parseFloat(people[p].retirementAge)) {
            contributions = parseFloat(people[p].accounts[a].annual_contribution) + parseFloat(people[p].accounts[a].catchup_contribution)
                              
            traditional401k = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, traditional401kPriorBalance, contributions, rateOfReturn, periods)
            traditional401kPriorBalance = parseFloat(traditional401k)

          }else if (evalAge  >= parseFloat(people[p].retirementAge)){
            contributions = 0
                              
            traditional401k = accountGrowth(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, traditional401kPriorBalance, contributions, rateOfReturn, periods)
            withdrawAmount += withdraw(traditional401k, withdrawRate)
            taxableWithdraws += withdrawAmount
            traditional401kPriorBalance = parseFloat(traditional401k - withdrawAmount)
          }
            


          break
        case 'Roth 401k':
          //Set initial balance
          if(roth401kPriorBalance < 0){
            roth401kPriorBalance = people[p].accounts[a].balance
          }
  
          //Three scenarios for contributions and withdraws based on age
          evalAge = parseFloat(people[p].age) + i
          if ((people[p].age + i) < 50 ) {
            contributions = people[p].accounts[a].annual_contribution
            roth401k = accountGrowth(people[p].age, people[p].retirementAge, i, roth401kPriorBalance, contributions, rateOfReturn, periods)
            roth401kPriorBalance = roth401k
          }else if ((people[p].age + i) >= 50 && (people[p].age + i) < people[p].retirementAge) {
            contributions = people[p].accounts[a].annual_contribution + people[p].accounts[a].catchup_contribution
                              
            roth401k = accountGrowth(people[p].age, people[p].retirementAge, i, roth401kPriorBalance, contributions, rateOfReturn, periods)
            withdrawAmount += withdraw(traditional401k, withdrawRate)
            roth401kPriorBalance = roth401k
          }else if ((people[p].age + i) >= people[p].retirementAge){
            contributions = 0
                              
            roth401k = accountGrowth(people[p].age, people[p].retirementAge, i, roth401kPriorBalance, contributions, rateOfReturn, periods)
            withdrawAmount += withdraw(roth401k, withdrawRate)
            nonTaxableWithdraws += withdrawAmount                   
            roth401kPriorBalance = roth401k - withdrawAmount
          }
          break
        case 'IRA':
          //Set initial balance
          if(iraPriorBalance < 0){
            iraPriorBalance = people[p].accounts[a].balance
          }
  
          //Three scenarios for contributions and withdraws based on age
          if ((people[p].age + i) < 50 ) {
            contributions = people[p].accounts[a].annual_contribution
  
            IRA = accountGrowth(people[p].age, people[p].retirementAge, i, iraPriorBalance, contributions, rateOfReturn, periods)
            iraPriorBalance = IRA
          }else if ((people[p].age + i) >= 50 && (people[p].age + i) < people[p].retirementAge) {
            contributions = people[p].accounts[a].annual_contribution + people[p].accounts[a].catchup_contribution
                              
            IRA = accountGrowth(people[p].age, people[p].retirementAge, i, iraPriorBalance, contributions, rateOfReturn, periods)
            iraPriorBalance = IRA
          }else if ((people[p].age + i) >= people[p].retirementAge){
            contributions = 0
                              
            IRA = accountGrowth(people[p].age, people[p].retirementAge, i, iraPriorBalance, contributions, rateOfReturn, periods)
            withdrawAmount += withdraw(IRA, withdrawRate)
            taxableWithdraws += withdrawAmount
            iraPriorBalance = IRA - withdrawAmount
          }
          break
        case 'Roth IRA':
          //Set initial balance
          if(rothIRAPriorBalance < 0){
            rothIRAPriorBalance = people[p].accounts[a].balance
          }
  
          //Three scenarios for contributions and withdraws based on age
          if ((people[p].age + i) < 50 ) {
            contributions = people[p].accounts[a].annual_contribution
  
            rothIRA = accountGrowth(people[p].age, people[p].retirementAge, i, rothIRAPriorBalance, contributions, rateOfReturn, periods)
            rothIRAPriorBalance = rothIRA
          }else if ((people[p].age + i) >= 50 && (people[p].age + i) < people[p].retirementAge) {
            contributions = people[p].accounts[a].annual_contribution + people[p].accounts[a].catchup_contribution
                              
            rothIRA = accountGrowth(people[p].age, people[p].retirementAge, i, rothIRAPriorBalance, contributions, rateOfReturn, periods)
            rothIRAPriorBalance = rothIRA
          }else if ((people[p].age + i) >= people[p].retirementAge){
            contributions = 0
                              
            rothIRA = accountGrowth(people[p].age, people[p].retirementAge, i, rothIRAPriorBalance, contributions, rateOfReturn, periods)
            withdrawAmount += withdraw(rothIRA, withdrawRate)
            nonTaxableWithdraws += withdrawAmount
            rothIRAPriorBalance = rothIRA - withdrawAmount
          }
          break
        case 'Brokerage':
          //Set initial balance
          if(brokeragePriorBalance < 0){
            brokeragePriorBalance = people[p].accounts[a].balance
          }
  
          //Three scenarios for contributions and withdraws based on age
          if ((people[p].age + i) < people[p].retirementAge ) {
            contributions = people[p].accounts[a].annual_contribution
  
            brokerage = accountGrowth(people[p].age, people[p].retirementAge, i, brokeragePriorBalance, contributions, rateOfReturn, periods)
            brokeragePriorBalance = brokerage
          }else if ((people[p].age + i) >= people[p].retirementAge){
            contributions = 0
                              
            brokerage = accountGrowth(people[p].age, people[p].retirementAge, i, brokeragePriorBalance, contributions, rateOfReturn, periods)
            withdrawAmount += withdraw(brokerage, withdrawRate)
            capitalGainsWithdraws += withdrawAmount
            brokeragePriorBalance = brokerage - withdrawAmount
          }
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
      ssIncome = socialSecurityIncome(parseFloat(people[p].age), parseFloat(people[p].retirementAge), i, people[p].SSAge,people[p].estSSBenefits)
      net = netIncome(ssIncome, taxableWithdraws, nonTaxableWithdraws, capitalGainsWithdraws)
      taxes = taxesDue((taxableWithdraws + ssIncome), capitalGainsWithdraws)
      gross = (net - taxes)
      inflationAdjustedIncome = inflationAdjustedValue(gross, inflationRate, i)
    }


    //Add the Record to the dataset
    // let record = {y,traditional401k,roth401k,IRA,rothIRA,brokerage,withdraws,ssIncome,net,taxes,gross,inflationAdjustedIncome}
    // dataset.push(record)
    
    const newRecord = {
      year: y,
      traditional401k: parseFloat(traditional401k).toFixed(2),
      roth401k: parseFloat(roth401k).toFixed(2),
      rothIRA: parseFloat(rothIRA).toFixed(2),
      IRA: parseFloat(IRA).toFixed(2),
      brokerage: parseFloat(brokerage).toFixed(2),
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
    taxableWithdraws = 0
    nonTaxableWithdraws = 0
    capitalGainsWithdraws = 0
  }

  //return dataset
}



module.exports = { calculate }