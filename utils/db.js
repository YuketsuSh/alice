const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.json');

const readDB = () => {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}));
    }
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

const writeDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const pushToArrayDB = (key, value) => {
    const db = readDB();
    if (!db[key]) {
        db[key] = [];
    }
    db[key].push(value);
    writeDB(db);
};

module.exports = {
    readDB,
    writeDB,
    pushToArrayDB,
};
