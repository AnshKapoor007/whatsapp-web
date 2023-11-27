require('dotenv').config();

const config = {
    dbCredentials: {
        dbUrl: process.env.DB_URI,
    },
    application: {
        port: process.env.PORT,
        domainName: process.env.DOMAIN_NAME
    },
};

module.exports = config;
