const firebase = require('firebase');
const { FIREBASE } = require('./vars');

const firebaseConfig = {
  apiKey: FIREBASE.FIREBASE_API_KEY,
  authDomain: FIREBASE.FIREBASE_AUTHDOMAIN,
  projectId: FIREBASE.FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE.FIREBASE_MESSAGE_SENDER_ID,
  appId: FIREBASE.FIREBASE_APP_ID,
  measurementId: FIREBASE.FIREBASE_MEASUREMENT_ID
};
firebase.initializeApp(firebaseConfig);

const db = firebase.database();

module.exports = db;
