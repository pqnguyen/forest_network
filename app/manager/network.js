const fetch = require('node-fetch');

const getBlockWithHeight = async (height) => {
    let response = await fetch(`https://komodo.forest.network/block?height=${height}`);
    response = await response.json();

    return response.result;
};

module.exports = {
    getBlockWithHeight
};