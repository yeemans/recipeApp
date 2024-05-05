import { Routes, Route, BrowserRouter } from 'react-router-dom';
import React from "react";
import NotFound from './Components/NotFound.jsx';
import Register from './Components/Register.jsx';
import Profile from "./Components/Profile.jsx";
import Login from "./Components/Login.jsx";
import NewRecipe from "./Components/NewRecipe.jsx";
import ShowRecipe from "./Components/ShowRecipe.jsx";
import RecipeIsPrivate from './Components/RecipeIsPrivate.jsx';
import Navbar from './Components/Navbar.jsx';
import Logout from './Components/Logout.jsx';
import EditRecipe from './Components/EditRecipe.jsx';
import AddCollaborator from './Components/AddCollaborator.jsx';
import Search from './Components/Search.jsx';
import './App.css';

function Root() {

  return (
    <div className="App">
      <div className="main-content">
        <Navbar />
        <Routes>
          <Route path="/notFound" element={<NotFound />} />
          <Route path="/recipeIsPrivate" element={<RecipeIsPrivate />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/newRecipe" element={<NewRecipe />} />
          <Route path="/recipes/:id" element={<ShowRecipe />} />
          <Route path="/editRecipe/:id" element={<EditRecipe />} />
          <Route path="/addCollaborator/:id" element={<AddCollaborator />} />
          <Route path="/search" element={<Search />} />
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