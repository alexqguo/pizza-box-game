import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAKKSq0xjUYJTpmyVUntyERbOtBIrfNhr0",
  authDomain: "pizza-box-game.firebaseapp.com",
  databaseURL: "https://pizza-box-game.firebaseio.com",
  projectId: "pizza-box-game",
  storageBucket: "pizza-box-game.appspot.com",
  messagingSenderId: "567953049328",
  appId: "1:567953049328:web:be2fd0adf667325c6fe435",
  measurementId: "G-EW87WH3SNQ"
};

export const app: firebase.app.App = firebase.initializeApp(firebaseConfig);
export const db: firebase.database.Database = firebase.database();
firebase.analytics();