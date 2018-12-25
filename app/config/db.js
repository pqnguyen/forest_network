const Sequelize = require('sequelize');

const db = new Sequelize('network', 'root', 'root', {
    host: '35.200.248.87',
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = db;