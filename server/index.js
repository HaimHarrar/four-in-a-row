const server = require('http').createServer();
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = 3000
const statusEnum = {
    EMPTY: 0,
    YELLOW: 1,
    RED: 2
}
const board2Darray = new Map()
const playersSet = new Map()
let firstName = ""
io.on('connection', client => {
    let roomIndex
    client.on("playerEnter", ({name}) => {
        console.log("playerEnter");
        console.log(client.id);
        playersSet.set(client.id, name)
        roomIndex = Math.ceil(playersSet.size/2);
        client.join(roomIndex)
        if(playersSet.size && !(playersSet.size % 2)){
            board2Darray.set(roomIndex, Array(42).fill(statusEnum.EMPTY));
            client.emit("getColor", {playerColor: statusEnum.YELLOW, name})
            io.to(roomIndex).emit("startPlaying", {board: board2Darray.get(roomIndex), names: {first: firstName, second: name}})
            console.log("startPlaying");
            console.info("starting game");
            
        }else {
            firstName = name
            client.emit("getColor", {playerColor: statusEnum.RED, name});
        }
    })
   
    client.on('play', ({color, index}) => {
        const findFreeSquare = (column) => {
            for(let i = 41 - (6 - column); i >= 0 ; i -= 7){
              if(!(board2Darray.get(roomIndex)[i])) return Number(i).toString(); //solve for index - 0
            }
            return false
        }

        const finalIndex = findFreeSquare(index % 7);
        if(finalIndex) {
            board2Darray.get(roomIndex)[finalIndex] = color
        }
        io.to(roomIndex).emit("play", {board: board2Darray.get(roomIndex), next: !!finalIndex})
        return false; 
    });

    client.on('disconnect', async () => {
        // need to delete all the room
        
        const a = await io.in(roomIndex).fetchSockets()
        const secondClientId = a[0].id
        playersSet.delete(secondClientId)
        playersSet.delete(client.id)
        io.to(roomIndex).emit("playerLeft")
        io.of("/").in(roomIndex).disconnectSockets()
    });
});
server.listen(port);