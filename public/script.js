
const socket = io("/");
const videoGrid = document.getElementById("video-grid")

const mypeer = new Peer({
    host : "/",
    port : '5051'
})
const myvideo = document.createElement("video");
myvideo.setAttribute("class", "democlass");
const vid = document.querySelector(".democlass")
myvideo.muted=true;

const peers = {}

let videobtn = true;
let audiobtn = true;




const user = prompt("Enter your name");


/* <button onclick="muteit()">mute</button>
<button onclick="startit()">start video</button> */

   let myVideoStream;
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio : true
    }).then(stream =>{
        myVideoStream=stream
        addvideoStream(myvideo,stream)
    
        mypeer.on('call', call =>{
            call.answer(stream)
    
            const video = document.createElement("video");
            call.on('stream',userVideoStream=>{
                addvideoStream(video,userVideoStream)
            })
        })
    
        socket.on('user-connected',userId=>{
            connectToNewUser(userId , stream)
        })
    })




 socket.on("user-disconnected",userId =>{
    if (peers[userId]) peers[userId].close()
 })

mypeer.on('open', id =>{
    socket.emit('join-room',ROOM_ID , id,user)
})


//To connect to new user funcrion
function connectToNewUser(userId,stream){
    const call = mypeer.call(userId,stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream =>{
        addvideoStream(video, userVideoStream)
    })
    call.on('close',()=>{
        video.remove()
    })

    peers[userId] = call
}


//Video stream adding funcrion
function addvideoStream(video,stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    })
    videoGrid.append(video)
}


const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});


// send msg 
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");


send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});


socket.on("createMessage", (message, userName) => {
  var time = new Date();
  let cur_time = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <span ${userName===user ? "class=outgoing" 
       : "class=incoming"}>${message}  <span class="time">   (From ${userName} ${cur_time}) <span></span>
       
    </div>`;
});