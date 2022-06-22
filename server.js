const express = require('express');
const app = express();
const uuid = require('uuid');
const server = require('http').Server(app);


//peer setup
const {ExpressPeerServer} = require('peer');
const  peerserver = ExpressPeerServer(server,{
    debug:true
})


//server 
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(server)



//view engine and static public files
app.set('view engine','ejs');
app.use(express.static('public'));
app.use('/peerjs',peerserver)

//ports
app.get('/',(req,res)=> {
    res.render('index',{meeting_id:req.query.meeting_id,meet_password:req.query.password,new_meetid:uuid.v4()})
})

app.get('/:room',(req,res)=>{
    if(req.query.username && req.query.password)
    {
        res.render('room',{roomId : req.params.room,username : req.query.username})
    }
    else{
        res.send('plz enter valid url or got the login page')
    }
})


const peer_name = [];

//sockets
io.on('connection',socket => {
    socket.on('join-room',(RoomID,userid,username) => {
        peer_name.push({RoomID,userid,username});
        console.log(RoomID)
        socket.join(RoomID);

       const peer_room =  peer_name.filter(peer => {
            return peer.RoomID===RoomID
        })

        socket.emit('getlist',peer_room)
        socket.broadcast.to(RoomID).emit('user-connected',userid,username);

        socket.on('disconnect', () => {
            socket.broadcast.to(RoomID).emit('user-disconnected', userid)
            if(peer_name.length>=0)
            {
                const a =peer_name.findIndex(peer => {
                    return peer.RoomID===RoomID&&peer.userid===userid&&peer.username===username;
                })
                if(a>=0 && a<peer_name.length)
                {
                    peer_name.splice(a,1)
                }
            }
        })
    })
    
    socket.on('message', (text,RoomID,username) => {
        socket.broadcast.to(RoomID).emit('recieved_message',text,username);
    })

})


//listen
server.listen(PORT)



