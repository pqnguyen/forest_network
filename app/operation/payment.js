const Account = require('../models/account');

const processPayment = async (account, tx) => {
    if (account.address === tx.params.address) {
        account.balance += tx.params.amount;
    } else {
        account.balance -= tx.params.amount;

        let receptionAccount = await Account.findOne({
            where: {address: tx.params.address}
        });

        if (!receptionAccount) {
            receptionAccount = await processCreateAccount(tx.params.address);
        }

        receptionAccount.balance += tx.params.amount;
        await receptionAccount.save();
    }
};

module.exports = {
    processPayment
};