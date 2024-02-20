import React, { useEffect, useState } from 'react';
import axios from 'axios'
import './RegistrationPage.css'; // import the CSS file
import { collection, addDoc } from "firebase/firestore";
import {db} from '../../firebase';

function RegistrationPage() {
  const [getMessage, setGetMessage] = useState({})
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    avatar: null,
    yearOfStudy: '1',
    courseTitle: '',
    activeStatus: 0,
    bio: '',
  });
  const [buttonClicked, setButtonClicked] = useState(false);

  const emailRegex = /^[^\s@]+@tcd\.ie$/i; // Regex to validate TCD email

  useEffect(()=>{
    axios.get('http://localhost:5000/flask/hello').then(response => {
      console.log("SUCCESS", response)
      setGetMessage(response)
    }).catch(error => {
      console.log(error)
    })

  }, [])

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(selectedImage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleYearChange = (e) => {
    setFormData({...formData, yearOfStudy: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(formData.email)) {
      setFormData({ ...formData, emailError: 'Must use a valid TCD email address' });      return;
    }
    else{
      setFormData({ ...formData, emailError: '' }); 
    }

    try {
      const docRef = await addDoc(collection(db, 'users'), formData);
      console.log('Document written with ID: ', docRef.id);

      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        avatar: null,
        yearOfStudy: '',
        courseTitle: '',
        bio: '',
      });
      setButtonClicked(true);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <div className="RegistrationPage">
      <header className="RegistrationPage-header">
        <h1>Registration</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <div className = "RegistrationBox">
            <div className="ProfilePicture">
              <p className="ProfilePictureText">Profile Picture</p>
              <img src={formData.avatar} alt="Preview" className="PreviewImage"/>
              <input className="ImageUpload" type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <div className = "row row-cols-2">
            <div className="col">
              <div className= "FirstName">
                <p>First Name</p>
                <input required className="FirstNameInput" name="firstName" value={formData.firstName} onChange={handleInputChange}/>
              </div>
            </div>
            <div className="col">
              <div className= "LastName">
                <p>Surname</p>
                <input required className="LastNameInput" name="lastName" value = {formData.lastName} onChange={handleInputChange}/>
              </div>
            </div>
            <div className =" col">
              <div className = "Email">
                <p>TCD Email Address</p>
                <input required className="EmailInput" name="email" value = {formData.email} onChange={handleInputChange}/>
                {formData.emailError && <p className="ErrorText">{formData.emailError}</p>}
              </div>
            </div>
            <div className = "col">
              <div className= "CourseName">
                <p>Course Title</p>
                <input required className="CourseNameInput" name="courseTitle" value = {formData.courseTitle} onChange={handleInputChange}/>
              </div>
            </div>
            <div className='col'>
            <div className="YearOfStudy" onChange={handleYearChange}>
                <p>Year of Study</p>
                <select value={formData.yearOfStudy} className="YearOfStudyInput">
                  <option value="1">Junior Freshman (Year 1)</option>
                  <option value="2">Senior Freshman (Year 2)</option>
                  <option value="3">Junior Sophister (Year 3)</option>
                  <option value="4">Senior Sophister (Year 4)</option>
                  <option value="5">Masters</option>
                  <option value="6">PhD</option>
                  <option value="7">Other</option>
                </select>
              </div>  
            </div>
          </div>
          <div className= "Bio">
            <p>Bio</p>
            <textarea className="BioInput" name="bio" value = {formData.bio} onChange={handleInputChange} />
          </div>
        </div>
        <button type = "submit" className="SubmitButton">
          Submit
        </button>
      </form>
    </div>
  );
}

export default RegistrationPage;