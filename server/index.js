const ShortUniqueId = require('short-unique-id');
const server = require('http').createServer();
const uid = new ShortUniqueId({ length: 8 });
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = 4000
const statusEnum = {
    EMPTY: 0,
    YELLOW: 1,
    RED: 2
}
const mapPlayersToRoom = new Map();
const mapRoomData = new Map();
let roomWaiting = ""

const findFreeSquare = (column, board) => {
    for(let i = 41 - (6 - column); i >= 0 ; i -= 7){
      if(!(board[i])) return Number(i).toString(); //solve for index - 0
    }
    return false
}

const isThereAWinner = (board) => {
    const ROWS_NUM = 7
    for(let i = 0; i < 42; i++){
        if(board[i] !== 0 && (((i + 3 < 42) && (Math.floor(i / ROWS_NUM) === Math.floor((i + 3) / ROWS_NUM)) && (board[i] === board[i + 1]) && (board[i] === board[i + 2]) && (board[i] === board[i + 3])) || 
        ((i + 18 < 42) && (Math.abs(Math.floor((i + 18) / ROWS_NUM) - Math.floor(i / ROWS_NUM)) === 3) && (board[i] === board[i + 6]) && (board[i] === board[i + 12]) && (board[i] === board[i + 18])) ||
        ((i + 21 < 42) && (Math.abs(Math.floor((i + 21) / ROWS_NUM) - Math.floor(i / ROWS_NUM) === 3)) && (board[i] === board[i + 7]) && (board[i] === board[i + 14]) && (board[i] === board[i + 21])) ||
        ((i + 24 < 42) && (Math.abs(Math.floor((i + 24) / ROWS_NUM) - Math.floor(i / ROWS_NUM)) === 3) && (board[i] === board[i + 8]) && (board[i] === board[i + 16]) && (board[i] === board[i + 24])))) {
            return true;
        }
    }
    return false;
}

io.on('connection', client => {   
    client.on("playerEnterRandom", ({name}) => {
        console.log("playerEnter");
        if(!roomWaiting){
            roomWaiting = uid.rnd();
            client.join(roomWaiting);
            mapPlayersToRoom.set(client.id, roomWaiting);
            client.emit("playerEnterData", {color: statusEnum.YELLOW})
            mapRoomData.set(roomWaiting, { yellowName: name });
        } else {
            client.join(roomWaiting);
            mapPlayersToRoom.set(client.id, roomWaiting);
            mapRoomData.set(roomWaiting, {board: Array(42).fill(statusEnum.EMPTY), redName: name, ...mapRoomData.get(roomWaiting)});
            client.emit("playerEnterData", {color: statusEnum.RED})
            io.to(roomWaiting).emit("startPlaying", mapRoomData.get(roomWaiting));
            roomWaiting = "";
        }

        client.on("playerPlay", ({color, index}) => {
            const board = mapRoomData.get(mapPlayersToRoom.get(client.id)).board;
            const finalIndex = findFreeSquare(index % 7, board);
            board[finalIndex] = color;
            mapRoomData.set(mapPlayersToRoom.get(client.id), {board, ...mapRoomData.get(mapPlayersToRoom.get(client.id))});
            io.to(mapPlayersToRoom.get(client.id)).emit("play", {board, next: !!finalIndex})
            if(isThereAWinner(board)){
                io.to(mapPlayersToRoom.get(client.id)).emit("winner", { color })
            }
        })
    })
   
    // client.on('play', ({color, index}) => {
    //     const findFreeSquare = (column) => {
    //         for(let i = 41 - (6 - column); i >= 0 ; i -= 7){
    //           if(!(roomMap.get(roomIndex)[i])) return Number(i).toString(); //solve for index - 0
    //         }
    //         return false
    //     }

    //     const finalIndex = findFreeSquare(index % 7);
    //     if(finalIndex) {
    //         roomMap.get(roomIndex)[finalIndex] = color
    //     }
    //     io.to(roomIndex).emit("play", {board: roomMap.get(roomIndex), next: !!finalIndex})
    //     return false; 
    // });

    // client.on('disconnect', (client) => {
    //     // need to delete all the room
    //     io.to(roomIndex).emit("playerLeft");
    //     playersSet.delete(client.id);
    // });
});
server.listen(port, () => {
    console.log(`server is running at port: ${port}`)
});