import { useContext, useState,useEffect } from "react";
import axios from 'axios';
import { UserContext } from "./UserContext";

export default function Register() {
    const [user, setUser] = useState({
        username: "",
        password: ""
    });
    const {person,setPerson,darkMode,setDarkMode}=useContext(UserContext);
    console.log("dark mode is :",darkMode)
    const [error, setError] = useState(false);
    const [notification, setNotification] = useState("");
    const [isLoginOrRegister,setIsLoginOrRegister]=useState('register');

    function handleChange(e) {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    }

    async function handleRegister(e) {
        e.preventDefault();

        try {
            const response = await axios.post('/register', { user });
            const data=response.data;
            console.log("data is "+data);
            setPerson(
              {
              username:user.username,
              id:data.id
              }
            )

            console.log("person in context"+person)
            console.log(response.data.message);
            setNotification("Registration successful");
            setError(false); 
            setTimeout(() => setNotification(""), 4000);

        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError(true);
                setNotification("Username already taken");
                setTimeout(() => setNotification(""), 4000);
                setTimeout(() => setError(false), 4000);
            } else {
                console.error("Registration failed:", error);
                setNotification("Something went wrong. Try again later.");
                setError(true);
                setTimeout(() => setNotification(""), 4000);
            }
        }
    }

    async function handleLogin(e){
        e.preventDefault();
        console.log("log in request")
        try {
            const response = await axios.post('/login', { user });
            const data=response.data;
            console.log("data is "+data);

            setPerson(
              {
              username:user.username,
              id:data.id
              }
            )

            console.log("person in context"+person)
            console.log(response.data.message);
            setNotification("Login successful");
            setError(false); 
            setTimeout(() => setNotification(""), 4000);

        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError(true);
                setNotification("Invalid username or password ");
                setTimeout(() => setNotification(""), 4000);
                setTimeout(() => setError(false), 4000);
            } else {
                console.error("Login failed : ", error);
                setNotification("Something went wrong. Try again later.");
                setError(true);
                setTimeout(() => setNotification(""), 4000);
            }
        }
    }
   
    return (
        <div className={`bg-blue-50 h-screen flex flex-col items-center justify-center ${
            darkMode ? "bg-gray-900" : ""
          }`}>
           <div className="fixed left-0 top-0 m-2">
  <div className="relative inline-block w-11 h-5">
    <input
      id="switch-component"
      type="checkbox"
      className={`peer appearance-none w-11 h-5 rounded-full cursor-pointer transition-colors duration-300 ${
        darkMode ?"bg-blue-500" : "bg-slate-800" 
      }`}
      checked={darkMode}
      onChange={() => setDarkMode(prev => !prev)}
    />
    <label 
      htmlFor="switch-component" 
      className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer">
    </label>
  </div>
</div>


        <div className={`text-6xl inline-block animate-bounce rounded-full p-4  text-bm font-sans font-bold  ${
            darkMode ? "text-white" : "text-blue-600"
          }`}>
        {isLoginOrRegister === "login" ? "Login" : "Register"}
        </div>
            <form className="w-64 mx-auto" onSubmit={isLoginOrRegister==='register'?handleRegister:handleLogin}>
            <input
  value={user.username}
  name="username"
  onChange={handleChange}
  type="text"
  placeholder="Username"
  className={`block w-full rounded-sm p-2 mb-2 border transition-colors duration-300 ${
    darkMode ? "bg-gray-800 text-white border-gray-600" : ""
  }`}
/>


<input
  value={user.password}
  name="password"
  onChange={handleChange}
  type="text"
  placeholder="Password"
  className={`block w-full rounded-sm p-2 mb-2 border transition-colors duration-300 ${
    darkMode ? "bg-gray-800 text-white border-gray-600" : ""
  }`}
/>

                <button className="bg-blue-500 text-white block w-full  rounded-sm p-2">
                {isLoginOrRegister === "login" ? "Login" : "Register"}
                </button>

                
                <div className={`text-center mt-2 ${darkMode?`text-white`:``}`}>
    {isLoginOrRegister === "login" ? (
        <>
            New to Us ? 
            <button 
                type="button"
                onClick={() => setIsLoginOrRegister('register')}
            >
                 Register here
            </button>
        </>
         ) : (
              <>
               Already a member ? 
               <button 
                type="button"
                onClick={() => setIsLoginOrRegister('login')}
               >
                Login here
            </button>
              </>
            )}
            </div>


                {notification && (
                    <div className={`block w-full p-4 text-white text-center rounded-md shadow-md mt-2 transition-opacity duration-500 ${
                        error ? "bg-red-500" : "bg-green-500"
                    }`}>
                        {notification}
                    </div>
                )}
            </form>
        </div>
    );
}
