const Account = require("../models/Account.js")

function addAccount(guipersonIDd, accountName, type, balance, annual_contribution, catchup_contribution) {

    let newAccount = new Account(guipersonIDd, accountName, type, balance, annual_contribution, catchup_contribution)

}