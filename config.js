const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyCQiZygTisSyVybPutYHOGCuLJq9zT20Bk",
    authDomain: "ismainstitution-30c61.firebaseapp.com",
    projectId: "ismainstitution-30c61",
    storageBucket: "ismainstitution-30c61.firebasestorage.app",
    messagingSenderId: "576655281200",
    appId: "1:576655281200:web:3c869361e6810a0595b1f5",
    measurementId: "G-PXHS5X153Y",
    databaseURL: "https://ismainstitution-30c61.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = db;  // CommonJS export