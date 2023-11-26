# WhatsApp Web Automation with Node.js

This Node.js application utilizes the WhatsApp Web API to send messages programmatically. It uses the `whatsapp-web.js` library along with MongoDB for storing authentication data.

## Prerequisites

Before running the project, make sure you have the following installed:

- [Node.js](https://nodejs.org/)

## Getting Started

1. Clone the repository to your local machine:
    ```bash
        git clone https://github.com/AnshKapoor007/whatsapp-web.git
        cd whatsapp-web
    ```

2. Install dependencies:
    ``` bash
        npm install
    ```

3. Start the application:
    ``` bash
        npm start
    ```
    The server will be running at http://localhost:3000.

## API Endpoints

1. Initialize Client:
   - Endpoint: GET /api/initialize-client/:phoneNumber
   - Description: Initializes a WhatsApp client for the specified phone number.
   - Response:
     - QR_CODE_REQUIRED - Returns a QR code string and status.
     - CLIENT_READY - Indicates that the client is ready.

2. Send Message:
   - Endpoint: POST /api/send-message/:phoneNumber
   - Description: Sends a message from the specified phone number to another.
   - Request Payload:
        ```json
        {
            "targetPhoneNumber": "Recipient's Phone Number",
            "message": "Your Message Here"
        }
        ```
   - Response:
     - MESSAGE SENT SUCCESSFULLY - Indicates successful message delivery.
     - UNABLE TO SEND MESSAGE - Indicates an issue with sending the message.

## Acknowledgments

1. whatsapp-web.js

2. MongoDB