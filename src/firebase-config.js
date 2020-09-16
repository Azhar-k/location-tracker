import * as firebase from 'firebase/app'
import 'firebase/database'

const firebaseConfig = {
    apiKey: "AIzaSyCdvIE86J76z5rS_Dj8gko-kJDCN7pgsMI",
    authDomain: "location-tracker-e1183.firebaseapp.com",
    databaseURL: "https://location-tracker-e1183.firebaseio.com",
    projectId: "location-tracker-e1183",
    storageBucket: "location-tracker-e1183.appspot.com",
    messagingSenderId: "301444227917",
    appId: "1:301444227917:web:869c310870cf4829718d04"
  };

  const app = firebase.initializeApp(firebaseConfig);

  export const db = app.database();