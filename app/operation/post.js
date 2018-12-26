const vstruct = require('varstruct');
const Post = require('../models/post');

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

const getParamsPost = (tx) => {
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

    return data;
};

module.exports = {
    processPost,
    getParamsPost
};