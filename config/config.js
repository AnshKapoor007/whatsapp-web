require('dotenv').config();

const config = {
    dbCredentials: {
        dbUrl: process.env.DB_URI,
    },
    application: {
        port: process.env.PORT,
    },
};

module.exports = config;
