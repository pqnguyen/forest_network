const Sequelize = require('sequelize');
const db = require('../config/db');

const Post = db.define('post', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    account: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
    },
    to_hash: {
        type: Sequelize.STRING,
        allowNull: false
    },
    time: {
        type: Sequelize.DATE,
        allowNull: false,
    }
});

module.exports = Post;