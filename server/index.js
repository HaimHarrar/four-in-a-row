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
const playersToRoom = new Map();
const roomsData = new Map();
const specificRooms = new Set();
let roomWaitingId = 0

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

const openRoom = (client, room, name) => {
    client.join(room);
    playersToRoom.set(client.id, room);
    client.emit("playerEnterData", {color: statusEnum.YELLOW})
    roomsData.set(room, {board: Array(42).fill(statusEnum.EMPTY), names:{[statusEnum.RED]: "", [statusEnum.YELLOW]: name}, clientsIds: [client.id], victoryCount: {[statusEnum.RED]: 0, [statusEnum.YELLOW]: 0}});
}

const joinRoom = (client, room, name) => {
    client.join(room);
    playersToRoom.set(client.id, room);
    client.emit("playerEnterData", {color: statusEnum.RED})
    const clientsIds = roomsData.get(room).clientsIds;
    clientsIds.push(client.id);
    const names = roomsData.get(room).names;
    names[statusEnum.RED] = name;
    const firstPlayer = Math.floor(Math.random() * (2)) + 1;
    roomsData.set(room, {...roomsData.get(room), firstPlayer, clientsIds, names, });
    io.to(room).emit("startPlaying", roomsData.get(room));
}

io.on('connection', client => {
    client.emit("updateRoomsList", Array.from(specificRooms));
    
    client.on("playerEnterRandom", ({name}) => {
        if(playersToRoom.get(client.id)) return;
        console.log("playerEnter");
        if(!roomWaitingId){
            roomWaitingId = uid.rnd();
            openRoom(client, roomWaitingId, name);
        } else {
            joinRoom(client, roomWaitingId, name);
            roomWaitingId = 0;
        }
    })

    client.on("playerEnterSpecific", ({room, name}) => {
        if(!room){
            const newRoomId = uid.rnd();
            specificRooms.add(newRoomId);
            openRoom(client, newRoomId, name);
            client.emit("waitForSpecificRoom", {room: newRoomId});
            io.emit("updateRoomsList", Array.from(specificRooms));
        } else {
            joinRoom(client, room, name);
            specificRooms.delete(room);
            io.emit("updateRoomsList", Array.from(specificRooms));
        }
    })
  
    client.on("playerPlay", ({color, index}) => {
        const board = roomsData.get(playersToRoom.get(client.id)).board;
        const finalIndex = findFreeSquare(index % 7, board);
        board[finalIndex] = color;
        roomsData.set(playersToRoom.get(client.id), {...roomsData.get(playersToRoom.get(client.id)), board});
        io.to(playersToRoom.get(client.id)).emit("play", {board, next: !!finalIndex})
        if(isThereAWinner(board)){
            const victoryCount = roomsData.get(playersToRoom.get(client.id)).victoryCount;
            victoryCount[color]++;
            roomsData.set(playersToRoom.get(client.id), {...roomsData.get(playersToRoom.get(client.id)), firstPlayer: color, victoryCount});
            io.to(playersToRoom.get(client.id)).emit("winner", { color })
        }
    })

    client.on("rematch", () => {
        if(roomsData.get(playersToRoom.get(client.id)).rematch){
            roomsData.set(playersToRoom.get(client.id), {...roomsData.get(playersToRoom.get(client.id)), rematch: false});
            io.to(playersToRoom.get(client.id)).emit("rematch", roomsData.get(playersToRoom.get(client.id)));
        } else {
            roomsData.set(playersToRoom.get(client.id), {...roomsData.get(playersToRoom.get(client.id)), board: Array(42).fill(statusEnum.EMPTY), rematch: true});
            client.emit("waitForRematch");
        }
    })

    client.on('disconnect', () => {
        if(playersToRoom.get(client.id)){       
            io.to(playersToRoom.get(client.id)).emit("playerLeft");
            const clientsIds = roomsData.get(playersToRoom.get(client.id)).clientsIds;
            const roomId = playersToRoom.get(client.id);
            clientsIds.forEach(id => {
                playersToRoom.delete(id);
            });
            specificRooms.delete(roomId);
            io.emit("updateRoomsList", Array.from(specificRooms));
            roomsData.delete(roomId);
        }
    });
});

server.listen(port, () => {
    console.log(`server is running at port: ${port}`)
});