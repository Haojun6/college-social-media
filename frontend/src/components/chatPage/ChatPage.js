import React from 'react';
import { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AllChatsForAModule from './AllChatsForAModule';
import TextInput from './TextInput';
import { useUpdatedChats } from './SendReceiveChats';
import User from '../../models/User';
import { useParams } from 'react-router-dom';
import './ChatPage.css';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../firebase.js';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


function ChatPage({ rootPage }) {
    const { moduleCode } = useParams();
    const [societyOrModule, setSocietyOrModule] = useState('');
    const textInputRef = useRef(null);

    const [userInfo, setUserInfo] = useState(null);

    // if the user is not logged in, redirect to the login page
    const navigate = useNavigate();
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (!user) {
                console.log("User is not logged in");
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (rootPage === '/societies') {
            setSocietyOrModule("societies");
        } else {
            setSocietyOrModule("modules");
        }
    }, [rootPage]);


    useEffect(() => {
        textInputRef.current?.scrollIntoView({ behavior: 'smooth' });
        getUser();
    }, []);

    // current User
    const getUser = async () => {
        try {
            const docRef = doc(db, "users", localStorage.getItem('userPrefix'));
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                const userData = docSnap.data();
                const { activeStatus, avatar, bio, courseTitle, email, name, yearOfStudy } = userData;
                const user = new User(docSnap.id, activeStatus, avatar, bio, courseTitle, email, name, yearOfStudy);
                console.log(user);
                setUserInfo(user);
            } else {
                console.log("No such document!");
            }
        } catch (e) {
            console.error("Error fetching document: ", e);
        }
    };


    return (
        <>
            <div className="module-chat-title">
                <div className="row justify-content-between align-items-center">
                    <div className="col-10 col-sm-10 col-md-11">
                        <Link to={rootPage}>
                            <button className='back-button'>
                                <i className="bi bi-arrow-left-square" style={{ color: 'var(--accent)', fontSize: '30px' }}></i>
                            </button>
                        </Link>
                        {moduleCode}
                    </div>
                    <div className="col-2 col-sm-2 col-md-1">
                        {/* if the rootpage is societies, add a button to the society profile page*/}
                        {rootPage === '/societies' && <Link to={`/societies/${moduleCode}/info`}>
                            <button className='back-button'>
                                <i className="bi bi-info-circle-fill" style={{ color: 'var(--accent)', fontSize: '30px' }}></i>
                            </button>
                        </Link>}
                    </div>
                </div>
            </div>
            <div className="chat-container">
                <div className="chat-content">
                    {societyOrModule && (
                        <>
                            <AllChatsForAModule societyOrModule={societyOrModule} moduleCode={moduleCode} />
                            {localStorage.getItem('society') === 'false' ?
                                <TextInput ref={textInputRef} societyOrModule={societyOrModule} moduleCode={moduleCode} user={userInfo} />
                                :
                                <div className="notPermittedBox">
                                    <h5>Society users have no permission to speak in the channel.</h5> </div>}
                        </>
                    )}
                </div>
            </div >
        </>
    );
}

export default ChatPage;