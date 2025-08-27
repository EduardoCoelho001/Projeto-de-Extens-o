
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyD3cM24tCyfy7OdjkW5Q0447wzIQPxZYEk",
    authDomain: "projetoacaapra.firebaseapp.com",
    projectId: "projetoacaapra",
    storageBucket: "projetoacaapra.firebasestorage.app",
    messagingSenderId: "65246289935",
    appId: "1:65246289935:web:921b9898f13b057eb4437a",
    measurementId: "G-9WT33504DG"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);