const express = require('express');
const config = require('./config/config');

const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');

const app = express();
const port = config.application.port || 3000;

app.use(express.json());

async function initializeClient(phoneNumber) {
    try {
        await mongoose.connect(config.dbCredentials.dbUrl);
        const store = new MongoStore({ mongoose: mongoose });

        const client = new Client({
            authStrategy: new RemoteAuth({
                clientId: phoneNumber,
                store: store,
                backupSyncIntervalMs: 300000
            })
        });

        app.locals[phoneNumber] = { client };

        client.initialize();

        return client;
    } catch (error) {
        throw error;
    }
}

app.get('/api/initialize-client/:phoneNumber', async (req, res) => {
    const phoneNumber = req.params.phoneNumber;

    try {
        const client = app.locals[phoneNumber] && app.locals[phoneNumber].client;

        if (!client) {
            const newClient = await initializeClient(phoneNumber);

            let responseSent = false;

            newClient.on('qr', qr => {
                if (!responseSent) {
                    responseSent = true;
                    res.send({ qr, status: 'QR_CODE_REQUIRED' });
                }
            });

            newClient.on('ready', () => {
                if (!responseSent) {
                    responseSent = true;
                    res.send({ status: 'CLIENT_READY' });
                }
            });
        } else {
            res.send({ status: 'CLIENT_READY' });
        }
    } catch (error) {
        res.status(500).send({ error: 'ERROR CHECKING CLIENT STATUS' });
    }
});

app.post('/api/send-message/:phoneNumber', async (req, res) => {
    const senderPhoneNumber = req.params.phoneNumber;
    const { targetPhoneNumber, message } = req.body;

    try {
        const client = app.locals[senderPhoneNumber].client;

        if (!client) {
            return res.status(404).send({ error: 'CLIENT NOT FOUND' });
        }

        const sanitized_number = targetPhoneNumber.toString().replace(/[- )(]/g, "");

        const final_number = `91${sanitized_number.substring(sanitized_number.length - 10)}`;

        const number_details = await client.getNumberId(final_number);

        if (number_details) {
            for (let i = 0; i < 10; i++)
                await client.sendMessage(number_details._serialized, message);
            res.status(200).send({ message: 'MESSAGE SENT SUCCESSFULLY' });
        }
        else {
            res.status(200).send({ message: 'UNABLE TO SEND MESSAGE' });
        }
    } catch (error) {
        res.status(500).send({ error: 'ERROR SENDING MESSAGE' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
