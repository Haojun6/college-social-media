import React, { useEffect, useState } from 'react';
import './Profile.css'; // import the CSS file
import { storage, db } from '../firebase.js';
import { doc, getDoc, getDocs, setDoc, deleteDoc, collection, query, where } from "firebase/firestore";
import { getStatus } from './getStatus.js';
import { getYear } from './getYear.js';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import { updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useLocation } from 'react-router-dom';
import changeActiveStatus from './changeActiveStatus.js';
import axios from 'axios'; // import axios for sending HTTP requests
import 'bootstrap/dist/js/bootstrap.bundle.min';

// Profile takes a username (the name of the collection in FB) as a prop

function Profile({ username }) {
  const params = useParams();
  username = params.id || localStorage.getItem('userPrefix');
  const my_username = localStorage.getItem('userPrefix');

  function IsMyProfile() {
    const location = useLocation();
    if (location.pathname == "/profile") return true;
    else return false;
  }

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    avatar: '',
    yearOfStudy: 0,
    courseTitle: '',
    activeStatus: 0,
    bio: ''
  });


  const [originalAvatar, setOriginalAvatar] = useState(userInfo.avatar);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editableBio, setEditableBio] = useState(userInfo.bio);
  const [originalBio, setOriginalBio] = useState(userInfo.bio);
  const [reportCard, setReportCard] = useState(false);
  const [reportData, setReportData] = useState({
    hate: false,
    harassment: false,
    violent: false,
    nudity: false,
    fake: false,
    description: ''
  });
  const [inFriendsList, setInFriendsList] = useState(false);

  // if user logged in as a society, redirect their own profile to the society page
  useEffect(() => {
    const societyExists = localStorage.getItem('society') !== 'false';
    if (societyExists && !params.id) {
      navigate(`/societies/${localStorage.getItem('society')}/info`);
    }
  }, [])

  const handleStatusChange = (newStatus) => {
    setUserInfo(prevState => ({
      ...prevState,
      activeStatus: newStatus,
    }));
    changeActiveStatus(newStatus);
  };

  const uploadAvatar = async (file) => {
    const storageRef = ref(storage, `avatars/${file.name}`);
    try {
      const uploadResult = await uploadBytes(storageRef, file);
      const avatarUrl = await getDownloadURL(uploadResult.ref);
      return avatarUrl;
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const updateProfileAvatar = async (username, avatarUrl) => {
    const userRef = doc(db, "users", username);
    await updateDoc(userRef, { avatar: avatarUrl });
  };

  const toggleBioEdit = () => {
    if (!isEditingBio) {
      setOriginalBio(userInfo.bio);
    } else {
      setEditableBio(originalBio);
    }
    setIsEditingBio(!isEditingBio);
  };

  // When the edit icon/button is clicked
  const handleEditAvatarClick = () => {
    setIsEditingAvatar(true);
  };

  // Handling file input change and upload
  const handleAvatarChange = async (event) => {
    console.log("File input changed");
    const file = event.target.files[0];
    if (!file) return;

    try {
      const avatarUrl = await uploadAvatar(file);
      await updateProfileAvatar(username, avatarUrl);
      setUserInfo({ ...userInfo, avatar: avatarUrl });
      setIsEditingAvatar(false);
    } catch (error) {
      console.error("Failed to upload new avatar: ", error);
    }
  };

  const cancelAvatarEdit = () => {
    setIsEditingAvatar(false);
    setUserInfo({ ...userInfo, avatar: originalAvatar });
  };

  const handleReportButtonClick = () => {
    setReportCard(true);
  }

  const handleCloseReport = () => {
    setReportCard(false);
  }

  useEffect(() => {
    setOriginalAvatar(userInfo.avatar);
  }, [userInfo.avatar]);



  // Function to save the new bio to Firestore
  const saveBio = async () => {
    try {
      const userRef = doc(db, "users", username);
      await updateDoc(userRef, { bio: editableBio });
      setIsEditingBio(false);
      setUserInfo({ ...userInfo, bio: editableBio }); // Update local state
    } catch (error) {
      console.error("Error updating bio: ", error);
    }
  };

  const handleReportFormSubmit = (e) => {
    e.preventDefault();
    // Handle report form submission
    console.log(reportData);
    // send report
    axios.get(`http://localhost:8000/send_report/${userInfo.email}`, {
      params: {
        form: JSON.stringify(reportData),
        username: userInfo.name
      }
    })
      .then(response => console.log(response))
      .catch(error => console.error(error));

    setReportCard(false);
  };

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


  const handleDMClick = () => {
    navigate(`/direct-messages/${userInfo.uid}`);
  };

  // add user to friends list
  const handleADDClick = async () => {
    try {
      // Create a reference to the specific document in the collection
      const friendDocRef = doc(db, "users", my_username, "friends", userInfo.uid);
      // Set the document with friend's info
      await setDoc(friendDocRef, {
        name: userInfo.name,
        uid: userInfo.uid,
        avatar: userInfo.avatar,
        courseTitle: userInfo.courseTitle,
      });
      console.log(`Friend ${userInfo.name} added successfully`);
      setInFriendsList(true);
    } catch (error) {
      console.error("Error adding friend: ", error);
    }
  }

  // check if the user is in the friends list
  const checkFriendExists = async (my_username, friendUID) => {
    try {
      // Validate input
      if (!my_username || !friendUID) {
        throw new Error("Missing username or friend UID");
      }

      // Create a reference to the specific document in the collection
      const friendDocRef = doc(db, "users", my_username, "friends", friendUID);

      // Attempt to fetch the document
      const docSnap = await getDoc(friendDocRef);

      // Check if the document exists
      if (docSnap.exists()) {
        setInFriendsList(true);
        console.log(`Friend with UID ${friendUID} exists in the friends list.`);
      } else {
        setInFriendsList(false);
        console.log(`Friend with UID ${friendUID} does not exist in the friends list.`);
      }
    } catch (error) {
      console.error("Error checking friend existence: ", error);
    }
  };



  useEffect(() => {
    // Define the function to fetch user profile
    const getUser = async () => {
      try {
        const docRef = doc(db, "users", username);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("Profile data:", docSnap.data());
          setUserInfo(docSnap.data());
        } else {
          console.log("No such profile!");
        }
      } catch (e) {
        console.error("Error adding profile: ", e);
      }
    };



    // Execute getUser immediately
    getUser();




  }, [username]); // Dependencies array to run the effect when `username` changes


  // check if the user is in the friends list
  useEffect(() => {
    if (!userInfo.uid) return;
    checkFriendExists(my_username, userInfo.uid);
  }, [userInfo.uid]);

  return (
    <div className="Profile">
      <div className="container">
        {/* profile card */}
        <div className="row mt-5 p-4 rounded border-0" style={{ position: 'relative' }} id="profileCard">
          {/* last page */}
          {!IsMyProfile() && (
            <button
              type="button"
              className="btn btn-secondary col-auto"
              id="lastPageButton"
              onClick={() => {
                navigate(-1);
              }}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
          )}
          <div className="col-5 ">
            <div className="profile-picture">
              <img src={userInfo.avatar} alt="User avatar" className="img-fluid" />
              {(!params.id || params.id === localStorage.getItem('userPrefix')) && !isEditingAvatar && (
                <button onClick={handleEditAvatarClick} className="editBtn"><i class="bi bi-pencil"></i></button>
              )}
              {isEditingAvatar && (
                <>
                  <div className="fileInputBtn">
                    <label htmlFor="file-upload">Choose File</label>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                  <button onClick={cancelAvatarEdit} className="cancelEditBtn">Cancel</button>
                </>
              )}
            </div>
          </div>
          <div className="col-7 border-0 ">
            <div className="row ">
              <p className="text-start"><h1 id="userName">{userInfo.name}</h1></p>
            </div>
            <div className="row ">
              <div className="col-5 ">
                <div className="user-details text-start ">
                  <p>{getYear(userInfo.yearOfStudy)}</p>
                  <p>{userInfo.courseTitle}</p>
                  {params.id ? (
                    <p>{getStatus(userInfo.activeStatus)}</p>
                  ) : (
                    <div className="dropdown">
                      <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        {userInfo.activeStatus === 0 && "🔘 Invisible"}
                        {userInfo.activeStatus === 1 && "🟢 Online"}
                        {userInfo.activeStatus === 2 && "🔴 Busy"}
                        {userInfo.activeStatus === 3 && "🟡 Away"}
                      </button>
                      <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        <li><button className="dropdown-item" type="button" onClick={() => handleStatusChange(1)}>🟢 Online</button></li>
                        <li><button className="dropdown-item" type="button" onClick={() => handleStatusChange(2)}>🔴 Busy</button></li>
                        <li><button className="dropdown-item" type="button" onClick={() => handleStatusChange(3)}>🟡 Away</button></li>
                        <li><button className="dropdown-item" type="button" onClick={() => handleStatusChange(0)}>🔘 Invisible</button></li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-7 border-0 rounded d-flex justify-content-center align-items-center" id="bioCard">
                {isEditingBio ? (
                  <>
                    <textarea
                      className="bioTextarea"
                      value={editableBio}
                      onChange={e => setEditableBio(e.target.value)}
                      autoFocus
                    />
                    <div className="editBtnContainer">
                      <button onClick={saveBio} className="bioSaveBtn">Save</button>
                      <button onClick={toggleBioEdit} className="bioCancelBtn">Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="m-0"
                      dangerouslySetInnerHTML={{
                        __html: userInfo.bio.replace(/\n/g, '<br />'),
                      }}
                    ></p>
                    {!params.id && (
                      <div className="editBtnContainer">
                        <button onClick={toggleBioEdit} className="bioEditBtn"><i class="bi bi-pencil"></i></button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* interact btns */}
        {/* not visible when checking self profile */}
        {params.id && (
          <div className="row mt-3 d-flex justify-content-end">
            <div className="col-auto">
              {!inFriendsList ? (
                <button className="btn bioBtn" onClick={handleADDClick}>ADD</button>
              ) : (
                <button className="btn bioBtn" disabled>ADDED</button>
              )}
            </div>
            <div className="col-auto" >
              <button className="btn bioBtn" onClick={handleDMClick} >DM</button>
            </div>
            <div className="col-auto">
              <button className="btn bioBtn" id="reportButton" onClick={handleReportButtonClick}>REPORT</button>
            </div>
          </div>
        )}
        {reportCard && (
          <div className="overlay">
            <div className="row rounded border-0" id="reportCard">
              <button onClick={handleCloseReport} className="btn btn-primary" id="closeReportBoxButton">X</button>
              <h1>Report User</h1>
              <p>Please select all that apply:</p>
              <form onSubmit={handleReportFormSubmit}>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" value={reportData.hate} id="hate" onChange={(e) => setReportData({ ...reportData, hate: e.target.checked })} />
                  <label className="form-check-label" htmlFor="hate">
                    Hate Speech
                  </label>
                </div>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" value={reportData.harassment} id="abuseharassment" onChange={(e) => setReportData({ ...reportData, harassment: e.target.checked })} />
                  <label className="form-check-label" htmlFor="abuseharrasment">
                    Bullying or Harassment
                  </label>
                </div>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" value={reportData.violent} id="violentspeech" onChange={(e) => setReportData({ ...reportData, violent: e.target.checked })} />
                  <label className="form-check-label" htmlFor="violentspeech">
                    Violent Speech
                  </label>
                </div>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" value={reportData.nudity} id="nudity" onChange={(e) => setReportData({ ...reportData, nudity: e.target.checked })} />
                  <label className="form-check-label" htmlFor="nudity">
                    Nudity or Inappropriate Content
                  </label>
                </div>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" value={reportData.fake} id="fake" onChange={(e) => setReportData({ ...reportData, fake: e.target.checked })} />
                  <label className="form-check-label" htmlFor="fake">
                    Pretending to be someone else
                  </label>
                </div>
                <div id="descriptionBox">
                  <p>Please provide any additional information (please include as much detail as possible, including the channel the message was sent to):</p>
                  <textarea value={reportData.description} onChange={(e) => setReportData({ ...reportData, description: e.target.value })}></textarea>
                </div>
                <div id="submitReport">
                  <button className="btn btn-primary" id="submitReportButton" type="submit">Submit Report</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}

export default Profile;
