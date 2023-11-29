const express = require('express');
const config = require('./config/config');

const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');

const app = express();
const port = config.application.port || 3000;
const domainName = config.application.domainName || 'localhost';

app.use(express.json());

mongoose.connect(config.dbCredentials.dbUrl)
    .then(() => {
        console.log('Connected to the DataBase');
        startServer();
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });

function startServer() {
    const store = new MongoStore({ mongoose: mongoose });

    app.locals.clients = {};

    async function initializeClient(phoneNumber) {
        try {
            const prevClient = app.locals.clients[phoneNumber];

            if (!prevClient) {
                const client = new Client({
                    authStrategy: new RemoteAuth({
                        clientId: phoneNumber,
                        store: store,
                        backupSyncIntervalMs: 300000
                    })
                });

                app.locals.clients[phoneNumber] = client;

                client.initialize();

                return client;
            }
            return prevClient;
        } catch (error) {
            throw error;
        }
    }

    app.get('/', async (req, res) => {
        res.send('Hello World');
    });

    app.get('/api/initialize-client/:phoneNumber', async (req, res) => {
        const phoneNumber = req.params.phoneNumber;

        try {
            const newClient = await initializeClient(phoneNumber);

            try {
                await newClient.getState();
                res.send({ status: 'CLIENT_READY' });
            } catch (err) {
                newClient.on('qr', qr => {
                    res.send({ qr, status: 'QR_CODE_REQUIRED' });

                });
            }
        } catch (error) {
            res.status(500).send({ error: 'ERROR CHECKING CLIENT STATUS' });
        }
    });

    app.post('/api/send-message/:phoneNumber', async (req, res) => {
        const senderPhoneNumber = req.params.phoneNumber;
        const { targetPhoneNumber, message } = req.body;

        try {
            const client = app.locals.clients[senderPhoneNumber];

            if (!client) {
                client = await initializeClient(senderPhoneNumber);

                try {
                    await client.getState();
                } catch (err) {
                    res.send({ status: 'CLIENT_SESSION_EXPIRED' });
                }
            }

            const sanitized_number = targetPhoneNumber.toString().replace(/[- )(]/g, "");

            const final_number = `91${sanitized_number.substring(sanitized_number.length - 10)}`;

            const number_details = await client.getNumberId(final_number);

            if (number_details) {
                await client.sendMessage(number_details._serialized, message);
                res.status(200).send({ message: 'MESSAGE SENT SUCCESSFULLY' });
            } else {
                res.status(200).send({ message: 'UNABLE TO SEND MESSAGE' });
            }
        } catch (error) {
            res.status(500).send({ error: 'ERROR SENDING MESSAGE' });
        }
    });

    app.listen(port, () => {
        console.log(`Server is running at http://${domainName}:${port}`);
    });
}
