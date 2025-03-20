import { useContext } from "react"
import RegisterAndLogin from"./RegisterAndLogin.jsx"
import { UserContext } from "./UserContext"
import Chat from "./Chat.jsx"

export default function Routes(){
    const {person}=useContext(UserContext)
    
    if(person.id)
    {
        return <Chat/>
    }



    return(
        <RegisterAndLogin/>
    )
}