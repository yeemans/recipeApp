import React from 'react';
import { Link } from 'react-router-dom'; // If using React Router for navigation
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import "../css/Navbar.css"

const Navbar = (props) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse navbar-container" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item link-container">
                        <Link className="nav-link" to={`/search`}>Search</Link>
                    </li>
                    
                    <li className="nav-item link-container">
                        <Link className="nav-link" to={`/`}>My Profile</Link>
                    </li>
                    <li className="nav-item link-container">
                        <Link className="nav-link" to="/newRecipe">New Recipe</Link>
                    </li>
                    <li className="nav-item link-container">
                        <Link className="nav-link" to="/logout">Logout</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
