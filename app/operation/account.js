const vstruct = require('varstruct');
const moment = require('moment');
const base32 = require('base32.js');

const Account = require('../models/account');
const Following = require('../models/following');

const {
    LIMIT,
    TRE_TO_CEL,
    BANDWIDTH_PERIOD,
    MAX_BLOCK_SIZE,
    RESERVE_RATIO,
    MAX_CELLULOSE,
    NETWORK_BANDWIDTH
} = require('../contants');


const Followings = vstruct([
    {name: 'addresses', type: vstruct.VarArray(vstruct.UInt16BE, vstruct.Buffer(35))},
]);

const processUpdateAccount = async (account, tx) => {
    const {key, value} = tx.params;
    if (key === 'name') {
        account.name = value.toString('utf-8');
    } else if (key === 'picture' && value.length > 0) {
        account.picture = `data:image/jpeg;base64,${value.toString('base64')}`;
    }
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

const processCalculateEnergy = (account, tx, block) => {
    let balance = account.balance / TRE_TO_CEL;
    const bandwidthLimit = Math.floor(balance * TRE_TO_CEL / MAX_CELLULOSE * NETWORK_BANDWIDTH);

    if (tx.account === account.address) {
        const time = moment(block.time).unix();
        const diff = account.bandwidthTime ? time - account.bandwidthTime : BANDWIDTH_PERIOD;
        account.bandwidth = Math.ceil(Math.max(0, (BANDWIDTH_PERIOD - diff) / BANDWIDTH_PERIOD) * account.bandwidth + tx.size);
        account.bandwidthTime = time;
        account.energy = bandwidthLimit - account.bandwidth;
    }
};


const processFollowing = async (account, tx) => {
    let followings = [];
    try {
        followings = Followings
            .decode(tx.params.value)
            .addresses.map(a => ({
                address: base32.encode(a),
            }));
    } catch (err) {
        console.log('err', err);
        followings = [];
    }

    await Following.create({
        account: account.address,
        followings: followings
    });
};

const getParamsUpdateAccount = (tx) => {
    let {key, value} = tx.params;

    const data = {
        key: key
    };
    value = Buffer.from(value);
    if (key === 'name') {
        data.name = value.toString('utf-8');
    } else if (key === 'picture' && value.length > 0) {
        data.picture = `data:image/jpeg;base64,${value.toString('base64')}`;
    }

    return data;
};

const getParamsCreateAccount = (tx) => {
    return tx.params;
};

const getParamsFollowings = async (tx) => {
    const data = {
        key: tx.params.key
    };
    try {
        data.followings = Followings
            .decode(Buffer.from(tx.params.value))
            .addresses.map(a => ({
                address: base32.encode(a),
            }));

        const accounts = await Account.findAll({
            where: {
                address: data.followings
            }
        });

        data.who = [];
        for (let account of accounts) data.who.push(account.toJSON());
    } catch (err) {
        data.followings = [];
    }

    return data;
};

module.exports = {
    processUpdateAccount,
    processCreateAccount,
    processCalculateEnergy,
    processFollowing,
    getParamsUpdateAccount,
    getParamsCreateAccount,
    getParamsFollowings
};
