const {createHash} = require('crypto');

const transaction = require("../lib/tx");

const data = "ATAdxPY3gelauaEcMyjMIuaJsiFe9bIO5kZTCil6jcMzJAwoAAAAAAAAABkQQ1RUNTIyLUNRMjAxNS8zMgIAKzCPdJHz39lUC70lFF7xTg0RMt6XXvAZYqbjiK+lXYEBWHhzAAAAAAX14QBVZYwaeBUzXpkYLalJ0rOrc6oGOe4338dUi3zPTOoPZHj+kl7rQMQPZYPAT2cNmCvwA2QexcPnbwlGumgQn4kL";

const decode = (data) => {
    data = new Buffer(data, 'base64');
    const tx = transaction.decode(data);
    tx.size = data.length;
    tx.hash = createHash('sha256').update(data).digest().toString('hex').toUpperCase();

    return tx;
};

module.exports = {
    decode
};