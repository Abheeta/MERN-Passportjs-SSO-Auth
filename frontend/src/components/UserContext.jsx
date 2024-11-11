import { createContext, useEffect, useState, useContext } from "react";

export const UserContext = createContext()

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({
    loggedIn: null,
  });

  useEffect(() => {
    fetchCurrentUser();
    console.log("fetching current user")
  }, []);


  const logoutCurrentUser = async () => {
    let response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {credentials: 'include'});
    response = await response.json()
    console.log(response);
    setCurrentUser({
      loggedIn: null,
    });
    window.location.href = '/home/apps';


  }

  const fetchCurrentUser = async () => {
    let response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/account`, {credentials: 'include'});
    response = await response.json()
    console.log(response);
    setCurrentUser(response)
  }
  console.log(JSON.stringify(currentUser), "CURRENT USERRRRRRRR")

  return (
    <UserContext.Provider value={{ currentUser, fetchCurrentUser, logoutCurrentUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useCurrentUser = () => useContext(UserContext)