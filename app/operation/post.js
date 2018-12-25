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

module.exports = {
    processPost
};