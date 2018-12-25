const Sequelize = require('sequelize');
const db = require('../config/db');

const Interaction = db.define('interaction', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    to_hash: {
        type: Sequelize.STRING,
        allowNull: false
    },
    account: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

module.exports = Interaction;