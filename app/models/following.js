const Sequelize = require('sequelize');
const db = require('../config/db');

const Following = db.define('following', {
    account: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    followings: {
        type: Sequelize.JSON,
        allowNull: true,
    }
});

module.exports = Following;

