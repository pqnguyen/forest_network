const LIMIT = 100;
const TRE_TO_CEL = 100000000;
const BANDWIDTH_PERIOD = 86400;
const MAX_BLOCK_SIZE = 22020096;
const RESERVE_RATIO = 1;
const MAX_CELLULOSE = Number.MAX_SAFE_INTEGER;
const NETWORK_BANDWIDTH = RESERVE_RATIO * MAX_BLOCK_SIZE * BANDWIDTH_PERIOD;

module.exports = {
    LIMIT,
    TRE_TO_CEL,
    BANDWIDTH_PERIOD,
    MAX_BLOCK_SIZE,
    RESERVE_RATIO,
    MAX_CELLULOSE,
    NETWORK_BANDWIDTH
};