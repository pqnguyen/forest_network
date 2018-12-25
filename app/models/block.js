const Sequelize = require('sequelize');
const db = require('../config/db');

const Block = db.define('block', {
    height: {
        type: Sequelize.BIGINT,
        primaryKey: true,
    },
    time: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    app_hash: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    hash: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

module.exports = Block;