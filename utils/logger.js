module.exports = {
    log: (message) => {
        console.log(`[LOG] ${message}`);
    },
    error: (message) => {
        console.error(`[ERROR] ${message}`);
    }
};