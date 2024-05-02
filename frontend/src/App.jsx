import { Routes, Route, BrowserRouter } from 'react-router-dom';
import React from "react";
import NotFound from './Components/NotFound.jsx';
import Register from './Components/Register.jsx';
import Profile from "./Components/Profile.jsx";
import Login from "./Components/Login.jsx";
import NewRecipe from "./Components/NewRecipe.jsx";
import ShowRecipe from "./Components/ShowRecipe.jsx";
import RecipeIsPrivate from './Components/RecipeIsPrivate.jsx';
import './App.css';


function Root() {
  return (
    <div className="App">
      <div className="main-content">
        <Routes>
          <Route path="/notFound" element={<NotFound />} />
          <Route path="/recipeIsPrivate" element={<RecipeIsPrivate />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/newRecipe" element={<NewRecipe />} />
          <Route path="/recipes/:id" element={<ShowRecipe />} />
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