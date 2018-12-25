const Sequelize = require('sequelize');
const db = require('../config/db');

const Transaction = db.define('transaction', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    account: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sequence: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    operation: {
        type: Sequelize.STRING,
        allowNull: false
    },
    hash: {
        type: Sequelize.STRING,
        allowNull: false
    },
    size: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    params: {
        type: Sequelize.JSON,
        allowNull: true
    },
    block_height: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    time: {
        type: Sequelize.DATE,
        allowNull: false
    }
});

module.exports = Transaction;