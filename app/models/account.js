const Sequelize = require('sequelize');
const db = require('../config/db');

const Account = db.define('account', {
    address: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    balance: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
    },
    energy: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
    },
    sequence: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
    },
    bandwidth: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
    },
    // Last transaction date for bandwidth calculate
    bandwidthTime: {
        type: Sequelize.DATE,
    },
    name: {
        type: Sequelize.STRING,
        defaultValue: ''
    },
    picture: {
        type: Sequelize.STRING,
        defaultValue: ''
    },
});

module.exports = Account;