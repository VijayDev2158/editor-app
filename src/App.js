import React from 'react';
import { BrowserRouter as Router, Route,  Routes } from 'react-router-dom';
import BrandKit from "./pages/BrandKit";
import Home from "./pages/Home";
import Templates from "./pages/Templates";
import Sidebar from './components/Sidebar';
import './App.css';
import VideoEditor from './VideoEditor/VideoEditor'

function App() {
  return (
    <Router>
      <div className="app">
        <div className="main-content">
          <Routes>
            <Route path="/" exact element={<Home/>} />
            <Route path="/templates" element={<Templates/>} />
            <Route path="/brand-kit" element={<BrandKit/>} />
            <Route path="/video-editor" element={<VideoEditor/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;