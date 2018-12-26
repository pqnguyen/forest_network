let {RpcClient} = require('tendermint');

const db = require('./config/db');
const localDb = require('./config/config');
const Transaction = require('./models/transaction');
const Account = require('./models/account');
const Block = require('./models/block');

const blockManager = require('./manager/block');

const syncDb = () => {
    db.sync().then(async () => {
        console.log('sync with database');
    }).catch(console.error);
};

const syncPublicNetwork = async () => {
    let client = RpcClient('wss://komodo.forest.network:443');

    client.subscribe({query: 'tm.event = \'NewBlock\''}, async (event) => {
        console.log('event', event);
        console.log('localDb.isSync', localDb.isSync);
        if (localDb.isSync) return;
        await blockManager.syncToPublicNode(event);
    });
    client.subscribe({query: 'tm.event = \'Tx\''}, (event) => {
        // console.log("Tx", event);
    });

    const app = async () => {
        await blockManager.syncToHeight(20000);
    };

    // await app();
};

const start = async () => {
    syncDb();
    await syncPublicNetwork();
};

module.exports = {
    start
};