import { useEffect,useState,useContext,useRef } from "react";
import { io } from "socket.io-client";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import axios from "axios"



export default function Chat(){

    const [socket, setSocket] = useState(null);
    const [onlinePeople,setOnlinePeople]=useState({});
    const[offlinePeople,setOfflinePeople]=useState({});
    const [selectedUserId,setSelectedUserId]=useState(null);
   const {person,setDarkMode,darkMode}=useContext(UserContext);
   const[newMessageText,setNewMessageText]=useState("");
   const[messages,setMessages]=useState([]);
   const divUnderMessages=useRef();
   
   

    useEffect(() => {
        const newSocket = io("http://localhost:4000",{
            withCredentials: true 
        });
        setSocket(newSocket);
       
        newSocket.on('message',handleMessage)
        
        return () => {
            newSocket.off('message', handleMessage);
        };
    }, []);
    

    function showOnlinePeople(peopleArray){
     const people={};
     peopleArray.forEach(person=>{
       people[person.userId]=person.username;
     })
    
    setOnlinePeople(people);
    }

    
    function handleLogout(){
        const logout=async()=>{
            try{
                const response=axios.post('/logout');
                socket.emit('logout');
    
                socket.disconnect();
                window.location.reload();
            }
            catch(err){
                console.log(error);
            }
         
        }
        logout();
    }


    function sendMessage(ev,file=null){

        
            if(ev)
            {
                ev.preventDefault();
            }
            
            console.log("sending message");
            console.log(selectedUserId+"  "+newMessageText)
            console.log(file);
            socket.emit('message',({
                
                    recipient:selectedUserId,
                    text:newMessageText,
                    file
                
            }
            ))
           

            if(file)
            {
                axios.get(`/messages/${selectedUserId}`);
                    const data=response.data;
                    setMessages(data);
            }
            else{
                setNewMessageText("");
                setMessages(prev=>([...prev,{text:newMessageText, 
                    isOur:true,
                    sender:person.id,
                    recipient:selectedUserId,
                    id:Date.now()
                }]));
            }
            console.log(messages)
            console.log(selectedUserId)
            
        }
       
        
    

    useEffect(()=>{
        const div=divUnderMessages.current;
       if(div){
        div.scrollIntoView({behaviour:'smooth' , block:'end'});
       }
       
    },[messages])
    

    useEffect(() => {
        
        if (selectedUserId) {
            const fetchMessages = async () => {
                try {
                    const response = await axios.get(`/messages/${selectedUserId}`);
                    const data=response.data;
                    setMessages(data);
                } catch (error) {
                    console.log("Error loading messages:", error);
                }
            };
    
            fetchMessages(); 
        }
    }, [selectedUserId]); 
    
  
    useEffect(()=>{
        const fetchData=async ()=>{
            try{
            const response=await axios.get('/people');
            const data=response.data;
            const offlinePeopleArray=data
            .filter(p=>p._id!=person.id)
            .filter((p)=>!Object.keys(onlinePeople).includes(p._id));
            const offlinePeople={};

            offlinePeopleArray.forEach(p=>{
                offlinePeople[p._id]=p.username;
            })
            
            setOfflinePeople(offlinePeople);
          
            }
            catch(error){
            console.log("error in fetching all users : "+error)
            }
        }


        fetchData();
    },[onlinePeople])

    function sendFile(ev){
      const reader=new FileReader();
      reader.readAsDataURL(ev.target.files[0]);
      reader.onload=()=>{
        sendMessage(null,{
            name:ev.target.files[0].name,
            data: reader.result,
        })
      }
    }

    

    function handleMessage(ev) {
        const messageData=JSON.parse(ev);
        console.log(messageData);
        if('online' in messageData)
        {
            showOnlinePeople(messageData.online)
        }
        else if('text' in messageData){
            setMessages(prev=>([...prev,{...messageData,
                 isOur:false}]));
            console.log("messageData",messageData)
           
        }

    }
   
   const onlinePeoplExcludingUser={...onlinePeople};
   delete onlinePeoplExcludingUser[person.id];
    

   return (
    <div className="flex h-screen ">
        <div className={` w-1/3 ${
            darkMode?`bg-gray-600`:`bg-white-100`
        }`}>
         <div>
            <Logo/>
            <div className="fixed left-[29.25rem] top-0 m-[1.5rem]">

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


        </div>
         
         
         <div className={`flex items-center space-x-4 p-4  shadow-lg rounded-lg ${darkMode?`bg-gray-600`:`bg-white`}`}>
  {/* SVG Icon */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-8 h-8  ${darkMode?`text-white`:`text-gray-600`}`}
  >
    <path
      fillRule="evenodd"
      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
      clipRule="evenodd"
    />
  </svg>


  {/* Username */}
  <div className={`text-xl font-semibold  px-4 py-2 rounded-lg  shadow-sm ${darkMode?`text-white bg-gray-500`:`text-gray-700 bg-gray-50`}`}>
    {person.username}
  </div>
</div>


{Object.keys(onlinePeoplExcludingUser).map(userId => (
  <div 
    key={userId}
    onClick={() => setSelectedUserId(userId)}
    className={`border-b border-gray-100 py-2 font-sans pt-3 p-2 text-xl flex gap-4 items-center cursor-pointer rounded-xl w-full 
      ${userId === selectedUserId ? "pl-5" : ""} 
      ${userId === selectedUserId && darkMode ? "bg-gray-500" : userId === selectedUserId ? "bg-blue-100" : ""}`}
  >
     
      {onlinePeople?.[userId] && (
  <>
    <Avatar online={true} username={onlinePeople[userId]} userId={userId} />
    <span className={darkMode?`text-white`:'text-gray-800'}>{onlinePeople[userId]}</span>
  </>
)}

        </div>
        ))}

         {Object.keys(offlinePeople).map(userId=>(
        <div key={userId}
        onClick={() => setSelectedUserId(userId)}
        className={`border-b border-gray-100 py-2 font-sans pt-3 p-2 text-xl flex gap-4 items-center cursor-pointer rounded-xl w-full  ${userId === selectedUserId ? "pl-5" : ""} 
      ${userId === selectedUserId && darkMode ? "bg-gray-500" : userId === selectedUserId ? "bg-blue-100" : ""}`}
      >
      
        
      {offlinePeople?.[userId] && (
  <>
     
    <Avatar online={false} username={offlinePeople[userId]} userId={userId} />

    <span className={darkMode?`text-white`:'text-gray-800'}>{offlinePeople[userId]}</span>
  </>
)}

            </div>
        ))}


<button
  onClick={handleLogout}
  className="fixed bottom-4 left-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300"
>
  Log Out
</button>


        
        </div>
        <div className={`flex flex-col  w-2/3 p-2 ${darkMode?`bg-gray-900`:`bg-blue-200`}`}>
        <div className="flex flex-col flex-grow">
    {!selectedUserId && (
      <div className="flex flex-col items-center justify-center h-full w-full gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-12 h-12 ${darkMode?`text-gray-400`:`text-gray-500`}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>

        <div className={`text-2xl font-medium ${darkMode?`text-gray-400`:`text-gray-500`}`}>No selected person</div>
      </div>
    )}

    {selectedUserId &&
    
      <div className="relative h-full">
       
         <div className="overflow-y-scroll top-0 right-0 left-0 bottom-2 absolute">
        {messages.map((message)=>(
            <div className={message.sender==person.id?'text-right':'text-left'}>
            <div className={`inline-block p-2 rounded-lg m-2 text-lg min-w-20 max-w-[60%]  ${message.sender===person.id?'bg-blue-500 text-white  ':'bg-white text-gray-700'}`}>
               {message.text}
               {message.file && (
                <div  className="flex items-center gap-1 underline ">
                    
                    <a target="_blank" classname="border-bottom" href={ axios.defaults.baseURL+'/Uploads/'+message.file}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 ">
               
               <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
             </svg>
                    


                    </a>
                    {message.file}
                    
                </div>
               )}
              
             
            </div>
            </div>
        ))}
        <div  ref={divUnderMessages}>
            </div>
     </div>
    </div>
    }
         </div>
         {selectedUserId &&
         <form className="flex gap-2 " onSubmit={sendMessage}>
            <input type="text" 
            value={newMessageText}
            onChange={ev=>setNewMessageText(ev.target.value)}
            className="bg-white flex-grow border rounded-sm p-2 w-12 h-12 mb-2 text-xl"
            placeholder="Type your message here"
             />

             <label type="button" 
              
             className="text-gray-800 p-1 duration-300 ease-in transform hover:scale-[1.3] cursor-pointer">
                
                <input type='file' className="hidden" onChange={sendFile}/>


                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`size-7 ${darkMode?`text-white`:`text-gray-700`}`}>
               
  <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
</svg>
</label>
             <button type="submit" className="bg-blue-700 p-2 text-white rounded-sm w-10 h-10"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
  <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
</svg>

</button>
             
         </form>
}
        </div>
         
    </div>
   )
}