const socket = io();
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
const ul_message = document.getElementById('input_messages');
const chat_window = document.querySelector('.main__chat__window')
const mute_icon = document.querySelector('.mute_icon');
const mute_text = mute_icon.nextElementSibling;
const cam_icon = document.querySelector('.cam_icon');
const main_left = document.getElementById('leftside')
const main_right  = document.getElementById('rightside')
const cam_text = cam_icon.nextElementSibling;
const chatting = document.getElementById('chatting');
const participants = document.getElementById('participants');

console.log(cam_text);
myVideo.muted = true;
console.log(username)

var peer = new Peer(undefined,{
    path: '/peerjs',
    host : '/',
    port:'443'
});

//savings call object of each user
const peer_list = {} 
let user_list = [];
let peer_room ;
let name_list;
let myVideostream
let myVideostream2
let flag =true

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream => {
    myVideostream = stream;
    addvideo(myVideo,stream,{username,userid:RoomID});
    
    socket.on('user-connected',(userid,username) => {
        user_list.push({userid: userid,username:username})
        console.log("new user connected",userid,username);
        ul_message.innerHTML+=`<div class="message_block"><div class="message_cover"><div class="username"><b>Admin</b></div><div>User <b>${username}</b> has joined Meet</div></div></div>`
        scrolldown();
        connectoNewUser(userid,stream,username);
    })

})



const addvideo = (video,stream,user) =>{
    console.log(user)
    const videoblock = document.createElement("div");
    const video_name = document.createElement("div");
    videoblock.setAttribute('id',`${user.userid}`)
    video_name.setAttribute('class',`video_name`)
    video_name.innerText = user.username
    video.srcObject = stream;
    video.setAttribute('poster',"Ankit")
    video.addEventListener('loadedmetadata',(e)=> {
        video.play();
        
    })
    videoblock.append(video);
    videoblock.append(video_name);
    videoGrid.append(videoblock)
    
}


peer.on('open',id => {
    console.log('my id is ',id)
    socket.emit('join-room',RoomID,id,username);
})

const connectoNewUser = (userid,stream,username) => {
        var call = peer.call(userid, stream);
        const video = document.createElement('video');
        call.once('stream', function(remoteStream) {
                addvideo(video,remoteStream,{userid,username})
        });
        
        call.on('close', () => {
            video.remove()
            console.log('removed it')
        })

        peer_list[userid] = call;

}



socket.on('getlist',(peer_room12)=>{
    peer_room = peer_room12
})


//Answering the call
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
peer.on('call', function(call) {
  getUserMedia({video: true, audio: true}, function(stream) {
    call.answer(myVideostream); // Answer the call with an A/V stream.

    console.log(peer_room)
    const a =peer_room.findIndex(peer => {
        return peer.userid===call.peer;
    })

    call.once('stream', function(remoteStream) {
        const video12 = document.createElement('video');
        addvideo(video12,remoteStream,{username:peer_room[a].username,userid:peer_room[a].userid})
    });
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
});
//scrooll down
const scrolldown = () =>{
    chat_window.scrollTop = chat_window.scrollHeight
}


//Getting Input Text message
const input_message = document.getElementById('input_message');
input_message.addEventListener('keypress' ,e => {

    if(e.key=== 'Enter' && input_message.value.trim() !== "")
    {
        const text = input_message.value.trim();
        socket.emit('message',text,RoomID,username);
        input_message.value ="";
        ul_message.innerHTML+=`<div class="message_block"><div class="row_reverse"><div class="message_cover self_message"><div class="username"><b>${username}</b></div><div>${text}</div></div></div></div>`
        scrolldown();
    }
    else if(e.key=== 'Enter' && input_message.value.trim() === "")
    {
        input_message.value ="";
    }
})


//getting the message from other user
socket.on('recieved_message',(text,username)=>{
    console.log(text);
    ul_message.innerHTML+=`<div class="message_block"><div class="message_cover"><div class="username"><b>${username}</b></div><div>${text}</div></div></div>`
    scrolldown();
})

//user disconnected
socket.on('user-disconnected', userId => {
    console.log('disconnected',userId)
    ul_message.innerHTML+= `<div class="message_block"><div class="message_cover"><div class="username"><b>Admin</b></div><div>User <b>${username}</b> has left Meet</div></div></div>`
    scrolldown();
    const video_block = document.getElementById(userId);
    video_block.classList.add('display-none')
    // video_block.remove();
    // if (peer_list[userId]) peer_list[userId].close()
})

const MuteUnmute = () => {
    const enabled = myVideostream.getAudioTracks()[0].enabled;
    if(enabled)
    {
        mute_icon.innerText = "mic_off"
        mute_text.innerText = "Unmute"
        mute_icon.classList.toggle("mic_off");
        myVideostream.getAudioTracks()[0].enabled=false;
    }
    else{
        mute_icon.innerText = "mic"
        mute_icon.classList.toggle("mic_off");
        mute_text.innerText = "Mute"
        myVideostream.getAudioTracks()[0].enabled=true;
    }
}

const video_on_off = () => {
    const enabled = myVideostream.getVideoTracks()[0].enabled;
    if(enabled)
    {
        cam_icon.innerText = "videocam_off"
        cam_text.innerText = "Start Video"
        cam_icon.classList.toggle("mic_off");
        myVideostream.getVideoTracks()[0].enabled=false;
        myVideostream.getVideoTracks()[0].srcObject = "./../public/cam_off.png"; 
        myVideostream.getVideoTracks()[0].kind = "img"; 
        console.log(myVideostream.getVideoTracks()[0]);
    }
    else{
        cam_icon.innerText = "videocam"
        cam_icon.classList.toggle("mic_off");
        cam_text.innerText = "Stop Video"
        console.log( myVideostream.type)
        myVideostream.getVideoTracks()[0].enabled=true;
    }
}

const leaveMeeting = () => {
    window.location = '/';
}

const chat_disp = () =>{
    
    if(main_right.classList.contains("display-none") || (!main_right.classList.contains("display-none") && chatting.classList.contains("display-none")))
    {
        main_right.classList.remove('display-none')
        main_left.classList.add('main__left')
        main_left.classList.remove('main__left_2')
        chatting.classList.add('display-none');
        participants.classList.add('display-none');
        chatting.classList.remove('display-none');
    }
    else{
        chatting.classList.add('display-none');
        participants.classList.add('display-none');
        main_right.classList.add('display-none')
        main_left.classList.add('main__left_2')
        main_left.classList.remove('main__left')
    }
}

const addparticipants = () =>{
    const participants_list = document.querySelector('.participants_list');
    console.log(participants_list);
    // const video_names = document.querySelectorAll('.video_name');
    var elements = document.getElementsByClassName("video_name");
    console.log("sdfhgkjwf : ",Array.from(elements)[0].innerText)
}

// addparticipants();

const part_disp = () =>{

    if(main_right.classList.contains("display-none") || (!main_right.classList.contains("display-none") && participants.classList.contains("display-none") )){
        
        const participants_list = document.querySelector('.participants_list');
        let insert ="";

        console.log(participants_list);

        let elements = document.getElementsByClassName("video_name");
        Array.from(elements).forEach(element => {
            console.log('1213',element.innerText)
            insert +=`<div id="participants_name">${element.innerText}</div>`
        })
        participants_list.innerHTML = insert;
        
        main_right.classList.remove('display-none')
        main_left.classList.add('main__left')
        main_left.classList.remove('main__left_2')

        chatting.classList.add('display-none');
        participants.classList.add('display-none');
        participants.classList.remove('display-none');
    }
    else{
        chatting.classList.add('display-none');
        participants.classList.add('display-none');
        main_right.classList.add('display-none')
        main_left.classList.add('main__left_2')
        main_left.classList.remove('main__left')
    }

}

