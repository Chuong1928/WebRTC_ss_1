var express =  require("express")
var app = express();
app.use(express.static("public"))
app.set("view engine", "ejs")
app.set("views", "./views")

var sever = require("http").Server(app)
var io = require("socket.io")(sever)
sever.listen(process.env.PORT || 3000)
// const redis = require("redis")
// const client = redis.createClient()

//JSON.parse(localStorage.getItem("users"))
const listUser =  []
var store = require('store')

store.set("history", {})
io.on("connection", function(socket){
    console.log("co nguoi ket noi " + socket.id);
    console.log("test")
    socket.on("create or join", room => {
        console.log("create or join to room", room);
        const myRoom = io.sockets.adapter.rooms[room] || {length: 0}
        const numClients = myRoom.length
        // console.log(myRoom);
        // console.log(myRoom.size);

        if(numClients == 0){
            socket.join(room)
            socket.emit("created", room)
        }else if(numClients !== 0){
            
            socket.join(room)
            socket.emit("joined", room)
            console.log("đã join");
        }else{
            socket.emit("full", room)
        }
        console.log(room, 'has', numClients, 'clients');
    })

    socket.on("ready", room => {
        console.log("đã readly");
        socket.broadcast.to(room).emit("ready", {
          guestId: socket.id
        })
     
    })

    socket.on("candidate", event => {
      

        socket.broadcast.to(event.room).emit("candidate", event)
    })

    socket.on("offer", event => {
      
       
        socket.broadcast.to(event.room).emit("offer", event.sdp)
    })

    socket.on("answer", event => {
       
        socket.broadcast.to(event.room).emit("answer", event.sdp)
    })

    socket.on("client-send-desc", (data) => {
      const {roomID, desc} =  data
      console.log("haha", data);
      socket.to(roomID).emit("request-rtc-connect", {
        guestId: socket.id,
        desc,
        roomID
      })
    })

    socket.on("client-send-back-desc", (data) => {
      const {roomId, desc} = data;
      socket.to(roomId).emit("request-update-rtc-connect", {
        guestId: socket.id,
        desc,
        roomId
      })
    })

    socket.on("client-send-icecandidate", (data) => {
      const { icecandidate } = data;
      socket.to(data.guestId).emit("send-icecandidate", {
        guestId: socket.id,
        icecandidate
      })
    })
    // socket.on("offer", function(description){
    //    // console.log(data);
    //    const pc = new RTCPeerConnection()
    //    pc.setRemoteDescription(new RTCSessionDescription(description))
    //    pc.createAnswer().then(sessionDescription => {
    //         pc.setLocalDescription(sessionDescription)
    //         socket.emit("answer", {type: "offer", sdp: sessionDescription})
    //    })
    // })

    // socket.on("candidate", data => {
    //     console.log(data);
    // })

//     // store.set('user', { id: socket.id })
//     // console.log(store.get('user'));
//    // client.rpush("tinnhan", `"user_1": "noidung"`)
//    // console.log(client.lrange("tinhan", 0, -1));
//     socket.on("user-login", function(data){
//         if(listUser.includes(data)){
//             socket.emit("login-fail")
//         }else{
//             listUser.push(data)
//             socket.usreName = data
//             socket.emit("you-login-sucess", data)
//             io.sockets.emit("list-user-online", listUser)
//             // client.lrange("history", 0, -1, (err, data) => {
//             //     data.map( x => {
//             //         const myData = x.split(":")
//             //         const userName = myData[0]
//             //         const content = myData[1]
        
//             //         socket.emit("display-history-message", {
//             //             userName : userName,
//             //             content: content
//             //         })
//             //     })
//             // })
//         }
//     })

//     socket.on("anybody-typinging", function(){
//         socket.broadcast.emit('someone-typing', socket.usreName + " đang nhập !");
//         console.log("co nguoi dang nhap");
//     })
    
//     socket.on("anybody-stop-typinging", function(){
//         socket.broadcast.emit('someone-stop-styping');
//     })

//     socket.on("anybody-send-message", (data) => {
//         let current_data =  {
//             userName: socket.usreName,
//             content: data
//         }
//         console.log("co nguoi gui tin nhan" + data);
//         let history = store.get('history')
//         store.set("history", {history,current_data } )
        
//         console.log(store.get('history'));
//        // history
//         io.sockets.emit("send-message-to-room", 
//         {
//             userName: socket.usreName,
//             content: data
//         })
//     })
})

console.log("alo 123");

app.get("/", function(req, res){
    res.render("home")
})