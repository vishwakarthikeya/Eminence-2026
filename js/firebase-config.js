
const firebaseConfig = {
  apiKey: "AIzaSyA-l1LTp2XxU-kiiB0zvk2Xk3qlI32NyOA",
  authDomain: "eminence-s.firebaseapp.com",
  databaseURL: "https://eminence-s-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "eminence-s",
  storageBucket: "eminence-s.firebasestorage.app",
  messagingSenderId: "477660408515",
  appId: "1:477660408515:web:c14625fdc36382a8e4d076",
  measurementId: "G-SLSHRK6637"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDatabase = database;