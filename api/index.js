require("dotenv").config();
const cors = require('cors');
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const bcrypt=require('bcrypt');
const {Server} = require("socket.io");
const Message=require("./models/Message");
const fs=require("fs");


const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

const User = require('./models/User.js');


app.use("/Uploads",express.static(__dirname+"/Uploads"));
app.use(express.json());
app.use(cookieParser()); 

app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));


mongoose.connect(MONGO_URL)
    .then(() => console.log('Connected to DB'))
    .catch((err) => console.error("MongoDB connection error:", err));


app.get('/', (req, res) => res.json("hey there"));

app.get('/test', (req, res) => res.json('test ok'));

app.get('/people',async(req,res)=>{
   const users=await User.find({},{'id':1,username:1});
   res.json(users);
});


app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json('No token'); 
    }

    jwt.verify(token, JWT_SECRET, {}, (err, userData) => {
        if (err) {
            return res.status(403).json('Invalid token'); 
        }
        res.json(userData);
    });
});




app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body.user; 
        console.log(req)
        console.log("username "+username)
        const dbUser = await User.findOne({ username });

        if (!dbUser) {
            console.log("returned ")
            return res.status(400).json({ message: "Invalid username or password" });
        }

        
        const isMatch = bcrypt.compare(password, dbUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        
        jwt.sign(
            { userId: dbUser._id, username: dbUser.username }, 
            JWT_SECRET, 
            {}, 
            (err, token) => {
                if (err) {
                    console.error("JWT Sign Error:", err);
                    return res.status(500).json({ error: "Token generation failed" });
                }

                return res.cookie('token', token, { 
                    httpOnly: true, 
                    secure: false, 
                    sameSite: 'lax', 
                    maxAge: 24 * 60 * 60 * 1000 
                }).status(200).json({ id: dbUser._id });
            }
        );

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});




app.post('/register', async (req, res) => {
    console.log("Full request body:", req.body); 
    const {user}=req.body;
    const { username, password } = user;
    console.log("username : "+username + "password:  " + password);

    try {
        const pastUser=await User.findOne({username:username})
        
        if(pastUser)
        {
            return res.status(400).json("UserName already taken");
        }


        const createdUser = await User.create({ username, password });
        jwt.sign({ userId: createdUser._id,
            username:createdUser.username
         }, JWT_SECRET, {}, (err, token) => {
            if (err) {
                console.error("JWT Sign Error:", err);
                return res.status(500).json({ error: "Token generation failed" });
            }
            console.log("User created and signed");
            console.log("token "+token);

            return res.cookie('token', token, { 
                httpOnly: true, 
                secure: false, 
                sameSite: 'lax', 
                maxAge: 24 * 60 * 60 * 1000 
              }).status(201).json({ id: createdUser._id });
              
        });
       

    } catch (error) {
        console.error("User registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});

async function getUserDataFromRequest(req) {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token;

        if (!token) {
            return reject('No token provided');
        }

        jwt.verify(token, JWT_SECRET, {}, (err, userData) => {
            if (err) {
                return reject('Invalid token'); 
            }
            resolve(userData);
        });
    });
}

app.post('/logout', (req, res) => {
    res.cookie('token', '', { 
        httpOnly: true, 
        secure: false, 
        sameSite: 'lax', 
        expires: new Date(0),  
        path: '/'
    });
    res.clearCookie('token', { path: '/' });
    return res.status(200).json({ message: 'Logged out' });
});





app.get('/messages/:userId',async (req,res)=>{
  const {userId}=req.params;
  const userData=await getUserDataFromRequest(req);
  console.log(userData);
  const ourUserId=userData.userId;
  console.log(userId,ourUserId);
  if(userId && ourUserId)
  {
    const messages=await Message.find({
        sender:{$in:[userId,ourUserId]},
        recipient:{$in:[userId,ourUserId]},
      }).sort({createdAt:1});
      res.json(messages);
  }
 
 

})


const server=app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    
});

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
        maxHttpBufferSize: 10 * 1024 * 1024
    }
});


io.on('connection', (socket) => {
   
    //read username and id for this connection
     const cookies=socket.handshake.headers.cookie;
     
    if(cookies)
    {
       
        const tokenCookieString =cookies.split(';').find(str=>str.startsWith('token='))
        if(tokenCookieString){
            const token=tokenCookieString.split('=')[1];
            if(token)
            {
                jwt.verify(token,JWT_SECRET,{},(err,userData)=>{
                  if(err) throw err;
                  const {userId,username}=userData
                  socket.userId = userId;
                  socket.username = username;
                })
            }
        }
    }


    
    // notify everyone about online People
    [...io.sockets.sockets.values()].forEach(client=>{
        client.send(JSON.stringify({
           online:[...io.sockets.sockets.values()].map(socket=>({
                userId:socket.userId,
                username:socket.username
            }))
    })
    )
    })

    socket.on("logout", ()=>{
        console.log("socket disconnected");
       socket.disconnect(true);
    })



   
    socket.on('message',async (message)=>{
        
        console.log("message");
        console.log(message.recipient)
        console.log(message.text);
        let filename=null;
        const {recipient,text,file}=message;
        if(file)
        {
            console.log(file);
            const parts=file.name.split('.');
            const ext=parts[parts.length-1];
            filename=Date.now()+'.'+ext;
            const bufferData = Buffer.from(file.data.split(',')[1], "base64");
            const path=__dirname+'/Uploads/'+filename;

            fs.writeFile(path,bufferData,()=>{
               console.log("file saved",path);
            })
        }

        if(recipient &&  (text || file))
        {
         const messageDoc= await Message.create({
          sender:socket.userId,
          recipient,
          text,
          file:file? filename : null
          });
           [...io.sockets.sockets.values()].filter(client=>client.userId===recipient).forEach(c=>c.send(JSON.stringify({text,
            sender:socket.userId,
            recipient,
            file:file?filename:null,
            id:messageDoc._id,
           })))
        }
    }) 
    
});


