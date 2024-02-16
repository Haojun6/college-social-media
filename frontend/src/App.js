import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios'



import NewPage from './components/NewPage'; // import NewPage
import Societies from './components/Societies'; // import Societies page
import NotificationsPage from './components/NotificationsPage/NotificationsPage';

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDAlrmNP4IydBXFKbj9ry7fZQmrswg1HKk",
  authDomain: "group-8---college-social-media.firebaseapp.com",
  projectId: "group-8---college-social-media",
  storageBucket: "group-8---college-social-media.appspot.com",
  messagingSenderId: "833481597283",
  appId: "1:833481597283:web:eeb23af113f6b5965bb356",
  measurementId: "G-CB5M15DR9W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


function App() {

  return (
    <div className="App">
      // Navigation Bar component will go here
    </div>
  );
}

export default App;