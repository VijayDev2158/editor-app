import React from 'react';
import './Home.css';
import img1 from '../Images/thumbnail1.jpg';
import img2 from '../Images/thumbnail2.jpg';
// Assuming you have these icon images
// import notificationIcon from '../Images/notificationIcon.png';
// import helpIcon from '../Images/helpIcon.png';
// import profileIcon from '../Images/profileIcon.png';
import { faBell, faQuestionCircle, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function Home() {
  const navigate =useNavigate()
  return (
    <div className="home">
        <Sidebar />
        <div style={{width:"100%"}}>
      <header>
        
        <div className="header-top">
          <input type="text" className="search-bar" placeholder="Search..." />
          <div className="icons">
            <FontAwesomeIcon icon={faBell} className="icon" />
            <FontAwesomeIcon icon={faQuestionCircle} className="icon" />
            <FontAwesomeIcon icon={faUserCircle} className="icon" />
          </div>
        </div>
        <h2>Let's create some <span>videos!</span></h2>
        <div className="actions">
          <button onClick={()=>navigate('/video-editor')}  >Create Project</button>
          <button>Record Video</button>
          <button>Create Avatar Video</button>
        </div>
      </header>
      <section className="recent-videos">
        <h3>Recent Videos</h3>
        <div className="videos row">
          <div className="video col-12">
            <img src={img1} alt="Video Thumbnail" />
            <div className="video-info">
              <span>Edit's Video - May 15, 2024</span>
              <span className="video-time">00:28</span>
            </div>
            <span className="draft">Draft</span>
          </div>
          <div className="video col-12">
            <img src={img2} alt="Video Thumbnail" />
            <div className="video-info">
            <span>Team's Video - May 15, 2024</span>
              <span className="video-time">00:45</span>
            </div>
            <span className="draft">Draft</span>
          </div>
        </div>
      </section>
      </div>
      <div style={{background:'red'}}></div>
    </div>
  );
}

export default Home;
