const Transaction = require('../models/transaction');
const Account = require('../models/account');
const Utils = require('../utils');
const {
    processCreateAccount, processUpdateAccount,
    processCalculateEnergy, processFollowing
} = require('../operation/account');
const {processPayment} = require('../operation/payment');
const {processPost} = require('../operation/post');
const {processInteract} = require('../operation/interact');

const createTransactionFromHashTx = async (hashedTx, block) => {
    const rawTx = Utils.decode(hashedTx);

    let tx = await Transaction.create({
        account: rawTx.account,
        sequence: rawTx.sequence,
        operation: rawTx.operation,
        params: rawTx.params,
        size: rawTx.size,
        hash: rawTx.hash,
        block_height: block.height,
        time: block.time
    });
    await processTx(tx.toJSON(), block);

    return tx;
};

const processTx = async (tx, block) => {
    let account = await Account.findOne({
        where: {address: tx.account}
    });

    if (!account) {
        account = await processCreateAccount(tx.account);
    }

    if (tx.operation === 'create_account') {
        await processCreateAccount(tx.params.address);
    }

    if (tx.operation === 'payment') {
        await processPayment(account, tx);
    }

    if (tx.operation === 'update_account') {
        await processUpdateAccount(account, tx);
    }

    if (tx.operation === 'post') {
        await processPost(account, tx);
    }

    if (tx.operation === 'update_account' && tx.params.key === 'followings') {
        await processFollowing(account, tx);
    }

    if (tx.operation === 'interact') {
        await processInteract(account, tx);
    }

    processCalculateEnergy(account, tx, block);
    account.sequence = tx.sequence;

    account = await account.save();
    return account;
};


module.exports = {
    createTransactionFromHashTx
};