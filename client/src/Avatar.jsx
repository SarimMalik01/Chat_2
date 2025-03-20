import { useContext } from "react";
import { UserContext } from "./UserContext";

export default function Avatar({ username, userId, online }) {

    const {darkMode,setDarkMode}=useContext(UserContext);
    function getColorFromId(id) {
      const colors = [
        "bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", 
        "bg-purple-400", "bg-pink-400", "bg-indigo-400", "bg-teal-400"
      ];
      const index = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
      return colors[index];
    }
  
    return (
      <div className={`w-12 h-12 relative ${getColorFromId(userId)} rounded-full flex items-center justify-center`}>
        <div className={`text-3xl font-lg ${
            darkMode?`text-white`:`text-gray-700 `
        }`}>{username[0]}</div>
       
        <div className={`absolute w-4 h-4 rounded-full bottom-0 right-0 border-2 border-white ${online ? "bg-green-500" : "bg-gray-400"}`}></div>
      </div>
    );
  }
  