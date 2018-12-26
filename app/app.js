const express = require('express');

const server = require('./server');
const utils = require('./utils');
const db = require('./config/db');
const Transaction = require('./models/transaction');
const Account = require('./models/account');
const Block = require('./models/block');
const Post = require('./models/post');
const Following = require('./models/following');
const Interaction = require('./models/interaction');

const app = express();

app.use(express.json());
app.use(express.urlencoded());

const port = 4000;

server.start();

app.get('/api/account', async (req, res) => {
    const {publicKey} = req.query;
    let account = await Account.findOne({
        where: {address: publicKey}
    });
    if (!account) {
        res.json({});
        return;
    }

    res.json(account.toJSON());
});


app.get('/api/posts', async (req, res) => {
    const {publicKey} = req.query;

    const account = await Account.findOne({
        where: {address: publicKey}
    });

    const posts = await Post.findAll({
        where: {
            account: account.address
        }
    });

    const toHashList = utils.buildFieldFromList(posts, 'to_hash');

    const interactions = await Interaction.findAll({
        where: {
            to_hash: toHashList
        }
    });

    let interactionMap = {};
    for (let interaction of interactions) {
        if (!interactionMap[interaction.to_hash]) {
            interactionMap[interaction.to_hash] = {
                'interactions': 0,
                'comments': []
            };
        }
        let postInteraction = interactionMap[interaction.to_hash];
        if (interaction.type === 1) {
            postInteraction['comments'].push({
                'content': interaction.content,
                'account': interaction.account
            });
        }
        if (interaction.type === 2) {
            postInteraction['interactions'] += 1;
        }
    }

    const response = [];
    for (let post of posts) {
        const data = post.toJSON();
        if (!interactionMap[post.to_hash]) {
            data['interact'] = {
                'interactions': 0,
                'comments': []
            };
        } else {
            data['interact'] = interactionMap[post.to_hash];
        }
        response.push(data);
    }

    res.json(response);
});

app.get('/api/followings', async (req, res) => {
    const {publicKey} = req.query;

    const account = await Account.findOne({
        where: {address: publicKey}
    });

    const followings = await Following.findOne({
        where: {
            account: account.address
        }
    });

    const followAddress = utils.buildFieldFromList(followings.followings, 'address');

    const followAccount = await Account.findAll({
        where: {
            address: followAddress
        }
    });

    const followAccountMap = {};
    for (let account of followAccount) followAccountMap[account.address] = account;

    const response = [];
    for (let address of followAddress) {
        if (followAccountMap[address]) {
            const account = followAccountMap[address];
            response.push(account.toJSON());
        }
    }

    res.json(response);
});

app.get('/api/transaction_history', async (req, res) => {
    const {publicKey} = req.query;

    const account = await Account.findOne({
        where: {address: publicKey}
    });
    const address = account.address;

    const transactions = await db.query(`select * from transactions
        where operation = 'payment'
        and ((account != '${address}' and JSON_EXTRACT(params, '$.address') = '${address}')
        or (account = '${address}' and JSON_EXTRACT(params, '$.address') != '${address}'));`
        , {model: Transaction});

    const response = [];
    for (let transaction of transactions) {
        const data = {
            address: transaction.account,
            amount: transaction.params.amount,
            time: transaction.time
        };
        if (transaction.account === account.address) {
            data.state = 'out';
        } else {
            data.state = 'in';
        }

        response.push(data);
    }

    res.json(response);
});

app.listen(port, () => console.log(
    `Example app listening on port ${port}!`
));