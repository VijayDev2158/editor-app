import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>My eDiToR</h1>
      </div>
      <nav>
        <ul>
          <li><NavLink exact to="/">Home</NavLink></li>
          <li><NavLink to="/templates">Templates</NavLink></li>
          <li><NavLink to="/brand-kit">Brand Kit</NavLink></li>
          <li><NavLink to="/team-trash">Team Trash</NavLink></li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
