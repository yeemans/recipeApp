import { Routes, Route, BrowserRouter } from 'react-router-dom';
import React from "react";
import Register from './Components/Register.jsx';
import Home from "./Components/Home.jsx";
import './App.css';


function Root() {
  return (
    <div className="App">
      <div className="main-content">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/home/:username" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  );
}

export default App;