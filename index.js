const express = require('express');
const app = express();
const twilio = require('twilio');

const PORT = process.env.PORT || 3000;
var dialog = require('./dialog.js');
var dialogConfig = dialog.dialogConfig;
var db = dialog.db;
var dialogFlow = dialog.dialogFlow;
var updateUser = dialog.updateUser;
var registerUser = dialog.registerUser;

var msg = require('./msg.js');
var sendMsg = msg.sendMsg;
var sendLocation = msg.sendLocation;

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`);
});

const goodBoyUrl =
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?' +
  'ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80';

const { MessagingResponse } = require('twilio').twiml;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/reply', async (req, res) => {
  const { body } = req;

  console.log(body);

  const {
    From: phoneNumber,
    ProfileName: profileName,
    Body: messageTextBody,
  } = body;
  console.log(body);
  db.ref('users/' + phoneNumber)
    .get()
    .then((snapshot) => {
      const userExists = snapshot.exists();

      console.log('userExists:', userExists, '\n');
      if (userExists) {
        const userData = snapshot.val();
        console.log(userData.stateId);
        const newState = dialogFlow(
          dialogConfig,
          userData.stateId,
          userData,
          body
        );
        if (newState) {
          console.log('newState written to db:', newState);
          updateUser(userData, 'stateId', newState);
        }
      } else {
        registerUser({ phoneNumber, profileName });

        // TODO: leaky abstraction this should be on the dialog function but whatever
        sendMsg(dialogConfig.init.message);
      }
    });
});
