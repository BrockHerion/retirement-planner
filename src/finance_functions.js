const store = require('./data/store')


function testPeeps(){
  store.getState().persons.map(p => console.log(p) )
}

//Get value of the model inputs
function getRoR(rateOfReturn){
  // console.log('RoR=', rateOfReturn)
  return rateOfReturn
}

function getInflationRate(inflationRate){
  // console.log('Inflation=', inflationRate)
  return inflationRate
}

function getWithdrawRate(withdrawRate){
  // console.log('Withdraw=', withdrawRate)
  return withdrawRate
}

function getYearsOfRetirement(yearsOfRetirement){
  // console.log('RearsOfRetirement=', yearsOfRetirement)
  return yearsOfRetirement
}
function getOutputType(outputType){
  // console.log('outputType=', outputType)
  return outputType
}
function getPersonFilter(personFilter){
  // console.log('outputType=', personFilter)
  return personFilter
}
function getAccountFilter(accountFilter){
  // console.log('outputType=', accountFilter)
  return accountFilter
}

//Growth of the investment principal 
function compoundInterest(principal , rate, periods, years) {
  return principal *  ((1 + (rate/periods))**(periods * years))
}

//Growth of contributions to an investment
function futureValueSeries(annual_contribution, rate, periods, years){

  return (annual_contribution / periods) * ((((1 + (rate/periods))**(periods * years)) -1) / (rate/periods))
}

//Growth fuctions combined into preand post retirement accumulation in the balance
function accountGrowth(person_age, person_retirement_age, years, principal, annual_contribution, rate, periods){
  if ((person_age + years) < person_retirement_age) {
    balance = compoundInterest(principal , rate, periods, 1) + futureValueSeries(contributions, rate, periods, 1)

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
      break;
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
function getDuration(people){
  let duration = 0
  let retirementYears = 10 //document.getElementById('inputDuration');
  
  for(i=0; i<people.length; i++){
    if((people[i].retirementAge - people[i].age) > duration){
      duration = people[i].retirementAge - people[i].age
    }
  }
  duration += retirementYears;
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
function calculateModelData(people, ror, withdrawRate, inflationRate, periods){
  //[filter logic]
  let duration = getDuration(people)
  let year = new Date().getFullYear()
  let dataset = []
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
  let taxableWithdraws = 0
  let nonTaxableWithdraws = 0
  let capitalGainsWithdraws=0
  let ssIncome =0
  let net = 0
  let taxes = 0
  let gross = 0

  //Loop for each year
  for(i=0; i < duration ; i++){
    const y = year++
        
    //Loop for each Person
    for(p=0; p < people.length ; p++){

      //Loop for each Account
      for(a=0; a < people[p].accounts.length ; a++){

        switch(people[p].accounts[a].type){
        case '401k':
          //Set initial balance
          if(traditional401kPriorBalance < 0){
            traditional401kPriorBalance = people[p].accounts[a].balance
          }

          //Three scenarios for contributions and withdraws based on age
          if ((people[p].age + i) < 50 ) {
            contributions = people[p].accounts[a].annual_contribution

            traditional401k = accountGrowth(people[p].age, people[p].retirementAge, i, traditional401kPriorBalance, contributions, ror, periods)
            traditional401kPriorBalance = traditional401k
          }else if ((people[p].age + i) >= 50 && (people[p].age + i) < people[p].retirementAge) {
            contributions = people[p].accounts[a].annual_contribution + people[p].accounts[a].catchup_contribution
                            
            traditional401k = accountGrowth(people[p].age, people[p].retirementAge, i, traditional401kPriorBalance, contributions, ror, periods)
            traditional401kPriorBalance = traditional401k
          }else if ((people[p].age + i) >= people[p].retirementAge){
            contributions = 0
                            
            traditional401k = accountGrowth(people[p].age, people[p].retirementAge, i, traditional401kPriorBalance, contributions, ror, periods)
            withdrawAmount += withdraw(traditional401k, withdrawRate)
            taxableWithdraws += withdrawAmount
            traditional401kPriorBalance = (traditional401k - withdrawAmount)
          }
          break;
        case 'Roth 401k':
          //Set initial balance
          if(roth401kPriorBalance < 0){
            roth401kPriorBalance = people[p].accounts[a].balance
          }

          //Three scenarios for contributions and withdraws based on age
          if ((people[p].age + i) < 50 ) {
            contributions = people[p].accounts[a].annual_contribution
            roth401k = accountGrowth(people[p].age, people[p].retirementAge, i, roth401kPriorBalance, contributions, ror, periods)
            roth401kPriorBalance = roth401k
          }else if ((people[p].age + i) >= 50 && (people[p].age + i) < people[p].retirementAge) {
            contributions = people[p].accounts[a].annual_contribution + people[p].accounts[a].catchup_contribution
                            
            roth401k = accountGrowth(people[p].age, people[p].retirementAge, i, roth401kPriorBalance, contributions, ror, periods)
            withdrawAmount += withdraw(traditional401k, withdrawRate)
            roth401kPriorBalance = roth401k
          }else if ((people[p].age + i) >= people[p].retirementAge){
            contributions = 0
                            
            roth401k = accountGrowth(people[p].age, people[p].retirementAge, i, roth401kPriorBalance, contributions, ror, periods)
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

            IRA = accountGrowth(people[p].age, people[p].retirementAge, i, iraPriorBalance, contributions, ror, periods)
            iraPriorBalance = IRA
          }else if ((people[p].age + i) >= 50 && (people[p].age + i) < people[p].retirementAge) {
            contributions = people[p].accounts[a].annual_contribution + people[p].accounts[a].catchup_contribution
                            
            IRA = accountGrowth(people[p].age, people[p].retirementAge, i, iraPriorBalance, contributions, ror, periods)
            iraPriorBalance = IRA
          }else if ((people[p].age + i) >= people[p].retirementAge){
            contributions = 0
                            
            IRA = accountGrowth(people[p].age, people[p].retirementAge, i, iraPriorBalance, contributions, ror, periods)
            withdrawAmount += withdraw(IRA, withdrawRate)
            taxableWithdraws += withdrawAmount
            iraPriorBalance = IRA - withdrawAmount
          }
          break;
        case 'Roth IRA':
          //Set initial balance
          if(rothIRAPriorBalance < 0){
            rothIRAPriorBalance = people[p].accounts[a].balance
          }

          //Three scenarios for contributions and withdraws based on age
          if ((people[p].age + i) < 50 ) {
            contributions = people[p].accounts[a].annual_contribution

            rothIRA = accountGrowth(people[p].age, people[p].retirementAge, i, rothIRAPriorBalance, contributions, ror, periods)
            rothIRAPriorBalance = rothIRA
          }else if ((people[p].age + i) >= 50 && (people[p].age + i) < people[p].retirementAge) {
            contributions = people[p].accounts[a].annual_contribution + people[p].accounts[a].catchup_contribution
                            
            rothIRA = accountGrowth(people[p].age, people[p].retirementAge, i, rothIRAPriorBalance, contributions, ror, periods)
            rothIRAPriorBalance = rothIRA
          }else if ((people[p].age + i) >= people[p].retirementAge){
            contributions = 0
                            
            rothIRA = accountGrowth(people[p].age, people[p].retirementAge, i, rothIRAPriorBalance, contributions, ror, periods)
            withdrawAmount += withdraw(rothIRA, withdrawRate)
            nonTaxableWithdraws += withdrawAmount
            rothIRAPriorBalance = rothIRA - withdrawAmount
          }
          break;
        case 'Brokerage':
          //Set initial balance
          if(brokeragePriorBalance < 0){
            brokeragePriorBalance = people[p].accounts[a].balance
          }

          //Three scenarios for contributions and withdraws based on age
          if ((people[p].age + i) < people[p].retirementAge ) {
            contributions = people[p].accounts[a].annual_contribution

            brokerage = accountGrowth(people[p].age, people[p].retirementAge, i, brokeragePriorBalance, contributions, ror, periods)
            brokeragePriorBalance = brokerage
          }else if ((people[p].age + i) >= people[p].retirementAge){
            contributions = 0
                            
            brokerage = accountGrowth(people[p].age, people[p].retirementAge, i, brokeragePriorBalance, contributions, ror, periods)
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

    }
    //Income calculations
    withdraws = (taxableWithdraws + nonTaxableWithdraws + capitalGainsWithdraws).toFixed(2)
    ssIncome = socialSecurityIncome(people[p].age, people[p].retirementAge, i, people[p].SSAge,people[p].estSSBenefits).toFixed(2)
    net = netIncome(ssIncome, taxableWithdraws, nonTaxableWithdraws, capitalGainsWithdraws).toFixed(2)
    taxes = taxesDue((taxableWithdraws + ssIncome), capitalGainsWithdraws).toFixed(2)
    gross = (net - taxes).toFixed(2)
    inflationAdjustedIncome = inflationAdjustedValue(gross, inflationRate, i).toFixed(2)

    //Add the Record to the dataset
    let record = {y,traditional401k,roth401k,IRA,rothIRA,brokerage,withdraws,ssIncome,net,taxes,gross,inflationAdjustedIncome}
    dataset.push(record)


    //reset at loop end
    taxableWithdraws = 0
    nonTaxableWithdraws = 0
    capitalGainsWithdraws = 0
  }

  return dataset
}


module.exports = { testPeeps, getRoR, getInflationRate, getWithdrawRate, getYearsOfRetirement, 
                   getOutputType, getPersonFilter, getAccountFilter, withdraw, compoundInterest, 
                   futureValueSeries, accountGrowth, socialSecurityIncome, taxesDue, 
                   inflationAdjustedValue, calculateModelData }