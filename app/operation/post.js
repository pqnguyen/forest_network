const vstruct = require('varstruct');
const Post = require('../models/post');
const Interaction = require('../models/interaction');

const PlainTextContent = vstruct([
    {name: 'type', type: vstruct.UInt8},
    {name: 'text', type: vstruct.VarString(vstruct.UInt16BE)},
]);

const processPost = async (account, tx) => {
    let post = null;
    try {
        if (tx.params.keys.length > 0) {
            throw Error('Cannot decrypt post');
        }
        post = PlainTextContent.decode(tx.params.content);
        if (post.type !== 1) {
            throw Error('Cannot decode post');
        }
        post = post.text;

        await Post.create({
            account: tx.account,
            content: post,
            to_hash: tx.hash,
            time: tx.time
        });
    } catch (err) {
        post = null;
    }
};

const getParamsPost = async (tx) => {
    const data = {};
    try {
        if (tx.params.keys.length > 0) {
            throw Error('Cannot decrypt post');
        }
        let post = PlainTextContent.decode(Buffer.from(tx.params.content));
        if (post.type !== 1) {
            throw Error('Cannot decode post');
        }
        data.post = post.text;
    } catch (err) {
        console.log('err', err);
        data.post = null;
    }

    const interactions = await Interaction.findAll({
        where: {
            to_hash: tx.hash
        }
    });

    data.comments = [];
    data.interactions = 0;
    for (let interaction of interactions) {
        if (interaction.type === 1) {
            data.comments.push({
                'content': interaction.content,
                'account': interaction.account
            });
        }
        if (interaction.type === 2) {
            data.interactions += 1;
        }
    }

    return data;
};

module.exports = {
    processPost,
    getParamsPost
};