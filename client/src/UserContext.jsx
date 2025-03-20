import { createContext, useState,useEffect} from "react";
import axios from "axios"
export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [person, setPerson] = useState({
        username: "",
        id: null
    });
    const [darkMode,setDarkMode]=useState(false);

     useEffect(()=>{
        axios.get('/profile').then((res)=>{
            const data=res.data;
           
            if(data)
            {
               
                setPerson({
                    username:data.username,
                    id:data.userId
                })
               
            }
            
        })
     })
    return (
        <UserContext.Provider value={{ person, setPerson,darkMode,setDarkMode }}>
            {children}
        </UserContext.Provider>
    );
}
