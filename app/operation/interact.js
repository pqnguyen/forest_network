const vstruct = require('varstruct');
const base32 = require('base32.js');

const Interaction = require('../models/interaction');

const PlainTextContent = vstruct([
    {name: 'type', type: vstruct.UInt8},
    {name: 'text', type: vstruct.VarString(vstruct.UInt16BE)},
]);

const ReactContent = vstruct([
    {name: 'type', type: vstruct.UInt8},
    {name: 'reaction', type: vstruct.UInt8},
]);

const processInteract = async (account, tx) => {
    let toHash = null;
    let reaction = null;
    let comment = null;

    toHash = tx.params.object;
    try {
        const temp_reaction = ReactContent.decode(tx.params.content);
        console.log('temp_reaction', temp_reaction);
        if (temp_reaction.type === 2) {
            reaction = temp_reaction;
        } else {
            reaction = null;
        }
    } catch (err) {
        reaction = null;
    }

    try {
        const temp_comment = PlainTextContent.decode(tx.params.content);
        console.log('temp_comment', temp_comment);
        if (temp_comment.type === 1) {
            comment = temp_comment;
        } else {
            comment = null;
        }
    } catch (err) {
        comment = null;
    }

    if (reaction || comment) {
        const content = reaction ? reaction.reaction : comment.text;
        const type = reaction ? 2 : 1;

        await Interaction.create({
            to_hash: toHash,
            account: account.address,
            content: content,
            type: type
        });
    }
};

const getParamsInteract = (tx) => {
    const data = {};
    data.toHash = tx.params.object;
    try {
        const temp_reaction = ReactContent.decode(Buffer.from(tx.params.content));
        if (temp_reaction.type === 2) {
            data.reaction = temp_reaction;
        } else {
            data.reaction = null;
        }
    } catch (err) {
        data.reaction = null;
    }

    try {
        const temp_comment = PlainTextContent.decode(Buffer.from(tx.params.content));
        if (temp_comment.type === 1) {
            data.comment = temp_comment;
        } else {
            data.comment = null;
        }
    } catch (err) {
        data.comment = null;
    }

    return data;
};

module.exports = {
    processInteract,
    getParamsInteract
};