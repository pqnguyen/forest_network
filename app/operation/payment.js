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

const getParamsPayment = async (account, tx) => {
    const data = {
        address: tx.params.address,
        amount: tx.params.amount
    };
    if (account.address === tx.params.address) {
        data.status = 'in';
    } else {
        data.status = 'out';
        let receptionAccount = await Account.findOne({
            where: {address: tx.params.address}
        });

        if (receptionAccount) {
            data.reception = receptionAccount.toJSON();
        }
    }

    return data;
};

module.exports = {
    processPayment,
    getParamsPayment
};