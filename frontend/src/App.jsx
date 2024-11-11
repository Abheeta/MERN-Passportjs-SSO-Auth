import { useState } from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from './components/Login';
import "./index.css";
import LoggedIn from './components/LoggedIn';
import { CurrentUserProvider } from './components/UserContext';



function App() {

  return (
    <>
      <Router>
        <CurrentUserProvider >
          <Routes>
            <Route path="/Login" Component={Login}/>
            <Route path="/home" Component={LoggedIn}/>
            <Route path="*" element={<Navigate to="/Login" replace />} />
          </Routes>
        </CurrentUserProvider>
      </Router>
    </>
  )
}

export default App
