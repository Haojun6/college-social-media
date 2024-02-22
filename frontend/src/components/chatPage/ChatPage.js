import React from 'react';
import { useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AllChatsForAModule from './AllChatsForAModule';
import TextInput from './TextInput';
import { useUpdatedChats } from './SendReceiveChats';
import User from '../../models/User';
import { useParams } from 'react-router-dom';
import './ChatPage.css';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

function ChatPage() {
    const { moduleCode } = useParams();

    const textInputRef = useRef(null);

    useEffect(() => {
        textInputRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // dummy user for testing
    const userOne = new User(
        0,
        "https://images.unsplash.com/photo-1587723958656-ee042cc565a1?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "Freshman at TCD 📚 | Diving into the world of Computer Science 💻",
        "Computer Science",
        "ballk@tcd.ie",
        "Karen Ball",
        1
    );

    const userTwo = new User(
        1,
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=2515&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "Year 3 CS Major @ TCD | Tech Visionary 🌟",
        "Computer Science",
        "lambertse@tcd.ie",
        "Sebastian Lambert",
        3
    );

    const userThree = new User(
        0,
        "https://images.unsplash.com/photo-1567270671170-fdc10a5bf831?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "TCD Year 2 | CS Explorer 🚀",
        "Computer Science",
        "petersa1@tcd.ie",
        "Amelia Peters",
        2
    );

    return (
        <>
            <div className="module-chat-title">
                <Link to="/modules">
                    <button className='back-button'>
                    <i className="bi bi-arrow-left-square" style={{ color: 'var(--accent)', fontSize: '30px' }}></i>                    
                    </button>
                </Link>
                {moduleCode}
            </div>
            <div className="chat-container">
                <div className="chat-content">
                    <AllChatsForAModule moduleCode={moduleCode} />
                    <TextInput ref={textInputRef} moduleCode={moduleCode} user={userTwo} />
                    {/* // user should be logged in user but using dummy user for now */}
                </div>
            </div>
        </>
    );
}

export default ChatPage;