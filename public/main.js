var socket = io("https://tsm-chat-app.herokuapp.com/")
var constraints = { audio: true, video: true }; 
let localVideo = document.getElementById("localVideo")
let remoteVideo = document.getElementById("remoteVideo")

const iceSevers = {
    'iceServer': [
        {
            'url': 'stun:stun.l.google.com:19302'
        }
    ]
}
let localStream, remoteStream, roomNumber, rtcPeerConnection, isCaller
$("#goRoom").click(function(){
    if($("#roomNumber").val() === ''){
        alert("Please type a room name")
    }else{
        roomNumber = $("#roomNumber").val()
        socket.emit("create or join", roomNumber)
        $("#selectRoom").addClass("d-none")
        $("#chat_room").removeClass("d-none")
    }
})

socket.on("created", room =>{
    console.log("created");
    navigator.mediaDevices.getUserMedia(constraints)
    .then( stream => {        
        
        localStream = stream       
        localVideo.srcObject = stream;
        isCaller =  true
    })
    .catch(err => {
        console.log("Lỗi", err);
    })
})

socket.on("joined", room =>{
    console.log("joined");
    navigator.mediaDevices.getUserMedia(constraints)
    .then( stream => {        
        localStream = stream       
        localVideo.srcObject = stream;
        socket.emit("ready", roomNumber)
    })
    .catch(err => {
        console.log("Lỗi", err);
    })
})

socket.on("ready", () => {
    console.log("on readly");
   
    if(isCaller){
        rtcPeerConnection = new RTCPeerConnection(iceSevers)
        rtcPeerConnection.onicecandidate = onIceCandidate
        rtcPeerConnection.ontrack = onAddStream
        rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
        rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream)
        rtcPeerConnection.createOffer()
            .then(sessionDescription =>{
                console.log("gửi đi offer",sessionDescription );
                rtcPeerConnection.setLocalDescription(sessionDescription)
                socket.emit("offer", {
                    type: "offer",
                    sdp: sessionDescription,
                    room: roomNumber
                    })
            })
            .catch(err =>{
                console.log(err);
            })
    }
})

socket.on('offer', (event) => {
    console.log("Nhận được offer");
    if(!isCaller){
        rtcPeerConnection = new RTCPeerConnection(iceSevers)
        console.log(rtcPeerConnection);
        rtcPeerConnection.onicecandidate = onIceCandidate
        rtcPeerConnection.ontrack = onAddStream
        rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
        rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream)
        console.log("Nhận được",event );
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
        rtcPeerConnection.createAnswer()
            .then(sessionDescription =>{
                console.log("gửi đi answer",sessionDescription );
                rtcPeerConnection.setLocalDescription(sessionDescription)
                socket.emit("answer", {
                    type: "answer",
                    sdp: sessionDescription,
                    room: roomNumber
                    })
            })
            .catch(err =>{
                console.log(err);
            })
    }
})

socket.on("answer", event =>{
    console.log("Nhận được answer", event);
    rtcPeerConnection.setRemoteDescription( new RTCSessionDescription(event))
})

socket.on("candidate", event => {
    console.log("Nhận được candidate");
    const candidate = new RTCIceCandidate({
        sdpMLineIndex: event.lablel,
        candidate: event.candidate
    })
    console.log("Nhận được candidate", candidate);
    rtcPeerConnection.addIceCandidate(candidate)
})

function onAddStream(event){

    remoteVideo.srcObject = event.streams[0]
    remoteStream =  event.streams[0]
}

function onIceCandidate(event) {
    if(event.candidate) {
        console.log("send ice candidate: ", event.candidate);
        socket.emit("candidate", {
            type: "candidate",
            lablel: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            room: roomNumber
        })
    }
}
// socket.on("answer", (description) => {
//     const pc =  new RTCPeerConnection()
//     pc.ontrack = (event) => remoteStream = event.stream
//     pc.setRemoteDescription(new RTCSessionDescription(description))
// })
// navigator.mediaDevices.getUserMedia(constraints)
// .then(function(mediaStream) {
//   var video = document.getElementById('selfview');
//   video.srcObject = mediaStream;
//   video.onloadedmetadata = function(e) {
//     video.play();
//   };
//   console.log(mediaStream);
//   const pc =  new RTCPeerConnection()
//   pc.addTrack(mediaStream.getTracks()[0])
//   pc.addTrack(mediaStream.getTracks()[1])
//   pc.createOffer().then(sessionDescription =>{
//       pc.setLocalDescription(sessionDescription)
//       socket.emit("offer", {type: "offer", sdp: sessionDescription})
//   })

//   pc.onicecandidate = (event) => {
//       console.log("render");
//       console.log(event);
//     socket.emit("candidate", {
//         type: "candidate",
//         lablel: event.candidate.sdpMLineIndex,
//         id: event.candidate.sdpMid,
//         candidate: event.candidate.candidate
//     })
//   }
//   console.log(pc);

// })
// .catch(function(err) { console.log(err.name + ": " + err.message); }); 

















// socket.on("login-fail", function(data){
//     $(".first").append("<p> Dang ky that bai</p>")
// })
// //let listUser = localStorage.getItem("users") ?? []

// socket.on("you-login-sucess", function(data){
//     $("#chat_room").removeClass("d-none")
//     $("#login_form").addClass("d-none")
//     //socket.broadcast.emit("anybody-login-sucess", )
//     $("#chat_room").attr("data-socket", data)
// })

// socket.on("list-user-online", function(data){
//     $(".chat_list").html("")
//    data.map((item) => {
//     $(".chat_list").append(`
//     <div class='chat_people py-3'>
//         <div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
//         <div class="chat_ib  position-relative">
//         <h5> ${item}</h5>
//         <span class="status f-online"></span>
//         </div>
//         </div>
//     `)
//    })
// })

// socket.on("someone-typing", function(data){
//     $(".write_msg").attr('placeholder',data);
// })

// socket.on("someone-stop-typing", function(data){
//     $(".write_msg").attr('placeholder', "Type a message");
// })

// const handlerDisplayYourMessage = (data) =>{
//     return(`
//         <div class="outgoing_msg">
//             <div class="sent_msg">
//             <p>${data}</p>
//             <span class="time_date"> 11:01 AM    |    June 9</span>
//             </div>
//         </div>
//     `)
// }

// const handlerDisplayGuestMessage = (data) =>{
//     return(`
//         <div class="incoming_msg">
//             <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
//             <div class="received_msg">
//             <div class="received_withd_msg">
//                 <p>${data}</p>
//                 <span class="time_date"> 11:01 AM    |    June 9</span>
//             </div>
//             </div>
//         </div>
//     `)
// }
// socket.on("send-message-to-room", function(data){
//     let socketId =  $("#chat_room").attr("data-socket")
   
//     data.userName == socketId ? $(".msg_history").append(handlerDisplayYourMessage(data.content)) : $(".msg_history").append(handlerDisplayGuestMessage(data.content))
    
    
// })

// socket.on("display-history-message", function(data){
//     let socketId =  $("#chat_room").attr("data-socket")
   
//     data.userName == socketId ? $(".msg_history").append(handlerDisplayYourMessage(data.content)) : $(".msg_history").append(handlerDisplayGuestMessage(data.content))
// })

// $(function(){
 
//     //socket.emit("hello", "xin chao")
//     $(".btn-login").click(function(e){
//         e.preventDefault()
//         socket.emit("user-login", $(".user-data").val())
//     })

//     $(".write_msg").focusin(function(){
//          let messeger = $(this).val()
//          console.log(messeger);
//         socket.emit("anybody-typinging")
//     })

//     $(".write_msg").focusout(function(){
//         // let messeger = $(this).val()
//         // console.log(messeger);
//         socket.emit("anybody-stop-typinging")
//     })

//     $(".msg_send_btn").click(function(e){
//         e.preventDefault();
//         let messeger =  $(".write_msg").val()
//         socket.emit("anybody-send-message", messeger)
//         $(".write_msg").val("")
//     })   

//     $('.write_msg').keypress(function(event){
//         let messeger =  $(".write_msg").val()
//         var keycode = (event.keyCode ? event.keyCode : event.which);
//         if (keycode == '13') {
//             socket.emit("anybody-send-message", messeger)
//             $(".write_msg").val("")
//         }
//     });
// })