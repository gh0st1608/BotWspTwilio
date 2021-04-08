### Twilio Account 

Create an account

### Add your number to the sandbox 

Send 'join opposite-cutting' to +1 415-523-8886

Your number should appear here:

    https://www.twilio.com/console/sms/whatsapp/sandbox

### Add API credentials

Get the Account SID and Auth Token from here:

    https://www.twilio.com/console/project/settings

Put them here

    .env

### Input your number

Change the const myNum to your number. Remember to add your country code. For example:

    +15107104699

### Run server

    npm install
    node index.js

### Localhost tunneling

In order to receive messages from Twilio you need to tunnel your localhost

    ngrok http 3000

Copy the forwarding address. It should look something like this:

    http://d9b521b42bc8.ngrok.io

Add the forwarding address in the "When a message comes in" field of the sandbox:

    https://www.twilio.com/console/sms/whatsapp/sandbox

### Test

Add +1-415-523-8886 to your contacts and send it a location. For testing, just search for a district in the search bar. For testing I've been using this:

   San Isidro Lima Peru 

On the results this should appear:

    San Isidro - Barranco Run

Click it!

