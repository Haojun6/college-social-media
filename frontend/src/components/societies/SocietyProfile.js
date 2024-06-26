import React, { useEffect, useState } from 'react';
import './SocietyProfile.css'; // import the CSS file
import { db } from '../../firebase.js';
import { doc, getDoc, getDocs, deleteDoc, collection, query, where, addDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios'; // Import Axios library for making HTTP requests
import Posts from '../Posts.js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // for Snow theme
// Profile takes a society name (the name of the collection in FB) as a prop

function SocietyProfile({ name }) {
  const params = useParams();
  name = params.name;
  const [societyInfo, setSocietyInfo] = useState({
    name: name,
    email: '',
    avatar: './',
    instagram: '',
    into: 'Loading...',
    twitter: '',
    website: ''
  });

  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [email, setEmail] = useState('');
  const [posts, setPosts] = useState([{}]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAddButtons, setShowAddButtons] = useState(false); // State to manage visibility of the Add Event button
  const [formError, setFormError] = useState('');
  const [postContent, setPostContent] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [postFormError, setPostFormError] = useState('');
  // if the user is not logged in, redirect to the login page
  const navigate = useNavigate();
  // if the user is not logged in, redirect to the login page
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

  const getPosts = async () => {
    try {
      const q = query(collection(db, "posts"), where("author", "==", name));
      const docSnap = await getDocs(q);
      if (!docSnap.empty) {
        const posts = [];
        docSnap.forEach((doc) => {
          const postData = doc.data();
          const postId = doc.id; // obtain document ID
          posts.push({ id: postId, ...postData }); // combine ID and postdata
        });
        console.log("Posts data:", posts);
        setPosts(posts);
      } else {
        console.log("No matching posts.");
        console.log(posts);
      }
    } catch (e) {
      console.error("Error getting documents: ", e);
    }
  };




  useEffect(() => {
    // get user profile from firebase
    const getSociety = async () => {
      try {
        const docRef = doc(db, "societiesProfile", name);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          setSocietyInfo(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    };
    console.log("Name:");
    console.log(name);
    getSociety();
    getPosts();
  }, [name])

  const handleSubmit = async (e) => {
    e.preventDefault();
    // check valid datetime
    if (new Date(startDateTime) >= new Date(endDateTime)) {
      setFormError('Start time must be earlier than end time.');
      return;
    }
    setFormError('');

    // Prepare the event object with the form values
    const event = {
      summary,
      location,
      description,
      start: {
        dateTime: startDateTime,
        timeZone: 'Europe/Dublin',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Europe/Dublin',
      },
      recurrence: [''],
      attendees: [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };
    const eventString = JSON.stringify(event);
    // Now you can send this event object to your backend API to create the event
    try {
      // Make HTTP POST request to Flask backend
      const currentDate = new Date();
      const docRef = await addDoc(collection(db, "posts"), {
        author: name,
        comment: 0,
        content: name + " has just created a new event! \nEvent: " + event.summary + "\nWhen: " + new Date(event.start.dateTime).toLocaleString() + " - " + new Date(event.end.dateTime).toLocaleString() + "\nWhere: " + event.location + "\nDescription: " + event.description,
        date: currentDate.toISOString(),
        like: 0,
        share: 0,
        title: `New Event! ${event.summary}`,
        isEvent: true,
        eventDetails: eventString
      });
      setShowEventForm(false);
      const response = await axios.post('http://localhost:8000//societies/:name/info', event);
      console.log('Event created:', response.data);
      window.location.reload();
    } catch (error) {
      console.error('Error creating event:', error.response.data);
    }
  };

  const handleAddEventClick = () => {
    setShowEventForm(true); // Set showEventForm to true when "Add Event" button is clicked
    setShowAddButtons(false); // Hide the Add Event button
  };

  const handleCloseEventBoxClick = () => {
    setShowEventForm(false);
    setShowAddButtons(true);
  };

    // Add this function to handle the post form submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (!postContent) {
      setPostFormError('Post content is required.');
      return;
    }
    setPostFormError('');

    try {
      const currentDate = new Date();
      await addDoc(collection(db, "posts"), {
        author: name,
        content: postContent,
        date: currentDate.toISOString(),
        like: 0,
        share: 0,
        title: `New Post by ${name}`,
        isEvent: false,
      });
      setShowPostForm(false);
      window.location.reload();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

    // Add this function to show the post form
  const handleAddPostClick = () => {
    setShowPostForm(true);
    setShowAddButtons(false);
  };

  // Add this function to hide the post form
  const handleClosePostBoxClick = () => {
    setShowPostForm(false);
    setShowAddButtons(true);
  };



  // if the user's society is the same as the profile, show the add event button
  useEffect(() => {
    if (localStorage.getItem('society') === name) {
      setShowAddButtons(true);
    }
  }, [name]);

  // NewPosts component
  const NewPosts = ({ initialPosts }) => {
    const modifiedPosts = initialPosts.map(post => ({
      ...post,
      content: <div dangerouslySetInnerHTML={{ __html: post.content }} />
    }));

    return <Posts initialPosts={modifiedPosts} />;
  };


  return (
    <div className="Profile">
      <div className="container">
        {/* profile card */}
        <div className="row mt-5 p-4 rounded border-0" style={{ position: 'relative' }} id="profileCard">
          {/* last page */}
          <button type="button" className="btn btn-secondary col-auto" id="lastPageButton" onClick={() => { navigate(-1); }}><i class="bi bi-arrow-left"></i></button>
          <div className="col-4 ">
            <div className="soc-profile-picture">
              <img src={societyInfo.avatar} alt="User avatar" className="img-fluid" />
            </div>
          </div>
          <div className="col-8 border-0 ">
            <div className="row ">
              <p className="text-start">
                <h1 id="societyName">{societyInfo.name}
                  {societyInfo.instagram && <a href={"https://www.instagram.com/" + societyInfo.instagram} target="_blank" rel="noreferrer">
                    <i className="bi bi-instagram icon"></i>
                  </a>}
                  {societyInfo.twitter && <a href={"https://www.twitter.com/" + societyInfo.twitter} target="_blank" rel="noreferrer">
                    <i className="bi bi-twitter-x icon"></i>
                  </a>}
                  {societyInfo.facebook && <a href={"https://www.facebook.com/" + societyInfo.facebook} target="_blank" rel="noreferrer">
                    <i className="bi bi-facebook icon"></i>
                  </a>}
                  {societyInfo.website && <a href={societyInfo.website} target="_blank" rel="noreferrer">
                    <i className="bi bi-globe icon"></i>
                  </a>}
                </h1>
              </p>
            </div>
            <div className="row">
              <div className="col border-0 rounded d-flex justify-content-center align-items-center" id="bioCard">
                <p className="m-4">{societyInfo.intro}</p>
              </div>
            </div>
          </div>
        </div>


        {/* society posts */}
        <div className="row mt-4 text-start">
          <h2 id="recentPosts">Recent Posts</h2>
        </div>
        <div className="row mt-1 p-4 rounded border-0 mb-4" id="userPosts">
          {/* head */}
          {posts.length > 0 && posts[0] && Object.keys(posts[0]).length > 0 ?
            <NewPosts initialPosts={posts} />
            : "No Posts Found."}
        </div>

        {showEventForm && (
          <div className="row mt-4 p-4 rounded border-0" id="createEvent">
            <h2 id="createEventTitle">Create Event</h2>
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="eventTitle" className="form-label">Title:</label>
                  <input type="text" className="form-control" id="eventTitle" value={summary} onChange={(e) => setSummary(e.target.value)} required />
                </div>
                <div className="col">
                  <label htmlFor="eventLocation" className="form-label">Location:</label>
                  <input type="text" className="form-control" id="eventLocation" value={location} onChange={(e) => setLocation(e.target.value)} required />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="start" className="form-label">Start Date Time:</label>
                  <input type="datetime-local" className="form-control" id="start" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} required />
                </div>
                <div className="col">
                  <label htmlFor="end" className="form-label">End Date Time:</label>
                  <input type="datetime-local" className="form-control" id="end" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} required />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="eventDescription" className="form-label">Description:</label>
                  <textarea className="form-control" id="eventDescription" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>
              </div>
              {formError && <p className="text-danger">{formError}</p>}
              <button className="btn btn-primary" type="submit" id="createEventButton">Create Event</button>
              <button type="button" className="btn btn-secondary ms-2" onClick={handleCloseEventBoxClick} id="closeEventBoxButton">Close</button>
            </form>
          </div>
        )}

        {showPostForm && (
          <div className="row mt-4 p-4 rounded border-0" id="createPost">
            <h2 id="createPostTitle">Create Post</h2>
            <form onSubmit={handlePostSubmit}>
              <div className="row mb-3">
                <div className="col">
                  <ReactQuill value={postContent} onChange={setPostContent} className="react-quill" />
                </div>
              </div>
              {postFormError && <p className="text-danger">{postFormError}</p>}
              <button className="btn btn-primary" type="submit" id="createPostButton">Create Post</button>
              <button type="button" className="btn btn-secondary ms-2" onClick={handleClosePostBoxClick} id="closePostBoxButton">Close</button>
            </form>
          </div>
        )}
        {showAddButtons && (
          <div className="row mt-4">
            <div className="col">
              <button onClick={handleAddEventClick} className="btn btn-primary me-5" id="addEventButton">Add Event</button>
              <button onClick={handleAddPostClick} className="btn btn-primary" id="addPostButton">Add Post</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default SocietyProfile;