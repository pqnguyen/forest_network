const express = require('express');

const server = require('./server');
const Transaction = require('./models/transaction');
const Account = require('./models/account');
const Block = require('./models/block');

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));