import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';

import Navbar from './components/NavBar';
import NotificationsPage from './components/NotificationsPage/NotificationsPage';
import RegistrationPage from './components/registrationPage/RegistrationPage';
import ModulesList from './components/module/ModuleList';
import SocietyList from './components/societies/SocietyList'; // import Societies page
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatPage from './components/chatPage/ChatPage'; // import ChatPage
import Login from './components/LoginPage';
import Profile from './components/Profile';
import LogoutPage from './components/Logout';
import SocietyProfile from './components/societies/SocietyProfile';
import DirectMessagesComponent from './components/chatPage/DirectMessagesComponent';
import FriendList from './components/friends/friendList';

const originalNavLinks = [
  { to: "/modules", label: "Modules" },
  { to: "/societies", label: "Societies" },
  { to: "/friends", label: <i class="bi bi-people-fill"></i>, alt: "Friends" },
  { to: "/notifications", label: <i class="bi bi-bell-fill"></i>, alt: "Notifications" },
  { to: "/profile", label: <i class="bi bi-person-circle"></i>, alt: "Profile" },
  { to: "/logout", label: <i class="bi bi-box-arrow-right"></i>, alt: "Logout" },
];


function App() {
  const [navLinks, setNavLinks] = useState(originalNavLinks);
  useEffect(() => {
    const updateNavLinks = () => {
      const societyExists = localStorage.getItem('society') !== 'false';
      const userExists = localStorage.getItem('userEmail') !== null;
      if (!userExists) {
        setNavLinks([]);
      }
      else if (societyExists) {
        let updatedLinks = [
          { to: `/societies/${localStorage.getItem('society')}`, label: "Chat" },
          { to: `/societies/${localStorage.getItem('society')}/info`, label: <i class="bi bi-person-circle"></i>, alt: "Profile" },
          { to: "/logout", label: <i class="bi bi-box-arrow-right"></i>, alt: "Logout" },
        ];
        setNavLinks(updatedLinks);

      } else {
        setNavLinks(originalNavLinks);
      }
    };
    updateNavLinks();
  }, []);

  // if there's no user info in localStorage, clear Firebase auth
  useEffect(() => {
    if (localStorage.getItem('userEmail') === null || localStorage.getItem('userEmail') === undefined) {
      // clean local storage
      localStorage.clear();
      // use firebase auth signOut
      const auth = getAuth();
      signOut(auth).then(() => {
        console.log('Logged out successfully.');
      }).catch((error) => {
        console.error('Error occurred during logging out', error);
      });
    }
  }, []);


  return (
    <div className="App">
      <Router>
        <Navbar navLinks={navLinks} />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/societies" element={<SocietyList />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/modules" element={<ModulesList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<Profile />} />
          <Route path="/modules/:moduleCode" element={<ChatPage rootPage={"/modules"} />} />
          <Route path="/societies/:moduleCode" element={<ChatPage rootPage={"/societies"} />} />
          <Route path="/societies/:name/info" element={<SocietyProfile />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/direct-messages/:uid" element={<DirectMessagesComponent />} />
          <Route path="/friends" element={<FriendList />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;