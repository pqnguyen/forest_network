const moment = require('moment');

const Transaction = require('../models/transaction');
const Account = require('../models/account');
const Utils = require('../utils');

const {
    LIMIT,
    TRE_TO_CEL,
    BANDWIDTH_PERIOD,
    MAX_BLOCK_SIZE,
    RESERVE_RATIO,
    MAX_CELLULOSE,
    NETWORK_BANDWIDTH
} = require('../contants');

const createTransactionFromHashTx = async (hashedTx, block) => {
    const rawTx = Utils.decode(hashedTx);

    let tx = await Transaction.create({
        account: rawTx.account,
        sequence: rawTx.sequence,
        operation: rawTx.operation,
        params: rawTx.params,
        size: rawTx.size,
        hash: rawTx.hash,
        block_height: block.height
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

    processCalculateEnergy(account, tx, block);
    account.sequence = tx.sequence;

    account = await account.save();
    return account;
};

const processCreateAccount = async (address) => {
    return await Account.create({
        address: address,
        balance: 0,
        sequence: 0,
        energy: 0,
        name: '',
        picture: '',
        bandwidth: 0,
        bandwidthTime: 0
    });
};

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

const processUpdateAccount = async (account, tx) => {
    const {key, value} = tx.params;
    if (key === 'name') {
        account.name = value.toString('utf-8');
    } else if (key === 'picture' && value.length > 0) {
        account.picture = `data:image/jpeg;base64,${value.toString('base64')}`;
    }
};


const processCalculateEnergy = (account, tx, block) => {
    let balance = account.balance / TRE_TO_CEL;
    const bandwidthLimit = Math.floor(balance * TRE_TO_CEL / MAX_CELLULOSE * NETWORK_BANDWIDTH);

    if (tx.account === account.address) {
        const time = moment(block.time).unix();
        const diff = account.bandwidthTime ? time - account.bandwidthTime : BANDWIDTH_PERIOD;
        account.bandwidth = Math.ceil(Math.max(0, (BANDWIDTH_PERIOD - diff) / BANDWIDTH_PERIOD) * account.bandwidth + time);
        account.bandwidthTime = time;
        account.energy = bandwidthLimit - account.bandwidth;
    }
};

module.exports = {
    createTransactionFromHashTx
};