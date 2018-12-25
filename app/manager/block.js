const Utils = require('../utils');
const Block = require('../models/block');
const networkManager = require('./network');
const txManager = require('./transaction');
const Queue = require('./queue');

let cacheLastestBlock = null;

const syncToPublicNode = async (newestBlock) => {
    const nHeight = newestBlock.block.header.height;
    await syncToHeight(nHeight);
};

const syncToHeight = async (toHeight) => {
    const height = await getHeightLastedSyncBlock();

    for (let i = height + 1; i <= toHeight; i++) {
        const orginalBlock = await networkManager.getBlockWithHeight(i);
        await processBlock(orginalBlock);
    }

    // const heights = [17588, 17594, 17751, 17753, 17804, 17810];
    // for (let height of heights) {
    //     const orginalBlock = await networkManager.getBlockWithHeight(height);
    //     await processBlock(orginalBlock);
    // }
};


const getDataFromBlock = (orginalBlock) => {
    const {block, block_meta} = orginalBlock;

    const header = block_meta.header;
    const block_id = block_meta.block_id;

    const {
        hash
    } = block_id;

    const {
        height,
        time,
        app_hash
    } = header;

    const {
        txs
    } = block.data;

    const data = {
        hash,
        height: parseInt(height),
        time,
        app_hash,
        txs
    };

    return data;
};

const processBlock = async (orginalBlock) => {
    // console.log('block', orginalBlock);
    const block = getDataFromBlock(orginalBlock);

    const txs = block.txs;
    processTxs(txs, block);

    let createdBlock = await Block.create({
        height: block.height,
        time: block.time,
        app_hash: block.app_hash,
        hash: block.hash
    });
    createdBlock = createdBlock.toJSON();
    cacheLastestBlock = createdBlock;

    return createdBlock;
};

const processTxs = (txs, block) => {
    txs && txs.forEach(async (tx) => {
        await txManager.createTransactionFromHashTx(tx, block);
    });
};

const getHeightLastedSyncBlock = async () => {
    if (cacheLastestBlock) {
        return cacheLastestBlock.height;
    }
    const blocks = await Block.findAll({
        'order': [
            ['height', 'DESC']
        ],
        'limit': 1
    });

    const height = blocks.length ? blocks[0].height : 0;

    return height;
};

module.exports = {
    syncToHeight,
    syncToPublicNode
};