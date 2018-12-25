let {RpcClient} = require('tendermint');

const db = require('./config/db');
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
    let check = false;

    client.subscribe({query: 'tm.event = \'NewBlock\''}, async (event) => {
        if (check) return;
        // await blockManager.syncToPublicNode(event);
        check = true;
    });
    client.subscribe({query: 'tm.event = \'Tx\''}, (event) => {
        // console.log("Tx", event);
    });

    const app = async () => {
        await blockManager.syncToHeight(500);
    };

    await app();
};

const start = async () => {
    syncDb();
    await syncPublicNetwork();
};

module.exports = {
    start
};