import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios'
import './NotificationsPage.css';
import NotificationBlock from './NotificationBlock';  
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useUpdatedNotifications, formatTimestamp } from './retrieveNotifications';

function NotificationsPage() {
  const [getMessage, setGetMessage] = useState({})
  const navigate = useNavigate();
  const directMentions = useUpdatedNotifications();
  const [emailCount, setEmailCount] = useState(0);

  
  useEffect(() => {
    // if the user is not logged in, redirect to the login page
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        console.log("User is not logged in");
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, []);


  const prevMentionsLengthRef = useRef(directMentions.length);

  useEffect(() => {
    if (directMentions.length > prevMentionsLengthRef.current) {
      const newNotification = directMentions[0];
      const senderEmail = newNotification.mentionedBy;
      const moduleCode = newNotification.moduleCode;
      const userEmail = localStorage.getItem('userEmail');
      axios.get(`http://localhost:5000/send_mail/${userEmail}?sender=${senderEmail}&module=${moduleCode}`)        
      .then(response => console.log(response))
        .catch(error => console.error(error));
    }
    prevMentionsLengthRef.current = directMentions.length;
  }, [directMentions]);

  useEffect(() => {
    axios.get('http://localhost:5000/flask/hello').then(response => {
      console.log("SUCCESS", response)
      setGetMessage(response)
    }).catch(error => {
      console.log(error)
    })
  }, []);
  return (
    <div className="NotificationsPage">
      <div className="NotificationsList">
        {directMentions.length > 0 ? (
          directMentions.map((notification) => (
            <NotificationBlock
              notificationType="directReply"
              mentionedBy={notification.mentionedBy}
              mentionedByAvatar={notification.mentionedByAvatar}
              mentionedByUserID={notification.mentionedByUserID}
              moduleCode={notification.moduleCode}
              timestamp={formatTimestamp(notification.timestamp)}
              message={notification.text}
            />
          ))
        ) : (
          <div className='no-notifs-block-outer'>
            <div className="no-notifs-block"><p>No Notifications</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;