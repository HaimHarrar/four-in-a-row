require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const socketEvents = require("../socketEvents.json");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');
const ShortUniqueId = require('short-unique-id');

const logStates = {
    DEBUG: 0,
    INFO: 1,
    ERROR: 2
}
let logStatus = process.env.LOG_STATUS || logStates.INFO

const logger = (msg, status) => {
    if(logStatus >= status) console.log(msg)
}

app.use(cors());
const uid = new ShortUniqueId({ length: 8 });

app.get('/hello', (req, res) => {
    res.send('hello')
})

const port = 4000
const statusEnum = {
    EMPTY: 0,
    FIRST: 1,
    SECOND: 2,
    FIRST_WIN: 3,
    SECOND_WIN: 4
}
const playersToRoom = new Map();
const roomsData = new Map();
const specificRooms = new Set();
let roomWaitingId = 0

const findFreeSquare = (column, board) => {
    for(let i = 41 - (6 - column); i >= 0 ; i -= 7){
      if(!(board[i])) return Number(i).toString(); //solve for index - 0
    }
    return ""
}

const isThereAWinner = (board, playerIndex) => {
    const ROWS_NUM = 7
    const newBoard = [...board]
    let isWinner = false
    for(let i = 0; i < 42; i++){
        if(board[i] !== 0) {
            if(((i + 3 < 42) && (Math.floor(i / ROWS_NUM) === Math.floor((i + 3) / ROWS_NUM)) && (board[i] === board[i + 1]) && (board[i] === board[i + 2]) && (board[i] === board[i + 3]))){
                isWinner = true
                newBoard[i] = playerIndex + 2;
                newBoard[i + 1] = playerIndex + 2;
                newBoard[i + 2] = playerIndex + 2;
                newBoard[i + 3] = playerIndex + 2;
            } else if((i + 18 < 42) && (Math.abs(Math.floor((i + 18) / ROWS_NUM) - Math.floor(i / ROWS_NUM)) === 3) && (board[i] === board[i + 6]) && (board[i] === board[i + 12]) && (board[i] === board[i + 18])){
                isWinner = true
                newBoard[i] = playerIndex + 2;
                newBoard[i + 6] = playerIndex + 2;
                newBoard[i + 12] = playerIndex + 2;
                newBoard[i + 18] = playerIndex + 2;
            } else if((i + 21 < 42) && (Math.abs(Math.floor((i + 21) / ROWS_NUM) - Math.floor(i / ROWS_NUM) === 3)) && (board[i] === board[i + 7]) && (board[i] === board[i + 14]) && (board[i] === board[i + 21])){
                isWinner = true
                newBoard[i] = playerIndex + 2;
                newBoard[i + 7] = playerIndex + 2;
                newBoard[i + 14] = playerIndex + 2;
                newBoard[i + 21] = playerIndex + 2;
            } else if((i + 24 < 42) && (Math.abs(Math.floor((i + 24) / ROWS_NUM) - Math.floor(i / ROWS_NUM)) === 3) && (board[i] === board[i + 8]) && (board[i] === board[i + 16]) && (board[i] === board[i + 24])){
                isWinner = true
                newBoard[i] = playerIndex + 2;
                newBoard[i + 8] = playerIndex + 2;
                newBoard[i + 16] = playerIndex + 2;
                newBoard[i + 24] = playerIndex + 2;
            }
        }
    }
    return {newBoard, isWinner};
}

const openRoom = (client, room, name) => {
    client.join(room);
    playersToRoom.set(client.id, room);
    client.emit(socketEvents.playerEnterData, {playerIndex: statusEnum.FIRST})
    roomsData.set(room, {board: Array(42).fill(statusEnum.EMPTY), names:{[statusEnum.SECOND]: "", [statusEnum.FIRST]: name}, clientsIds: [client.id], victoryCount: {[statusEnum.SECOND]: 0, [statusEnum.FIRST]: 0}, messages: []});
}

const joinRoom = (client, room, name) => {
    client.join(room);
    playersToRoom.set(client.id, room);
    client.emit(socketEvents.playerEnterData, {playerIndex: statusEnum.SECOND})
    const clientsIds = roomsData.get(room).clientsIds;
    clientsIds.push(client.id);
    const names = roomsData.get(room).names;
    names[statusEnum.SECOND] = name;
    const firstPlayer = Math.floor(Math.random() * 2) + 1;
    roomsData.set(room, {...roomsData.get(room), firstPlayer, clientsIds, names, });
    io.to(room).emit(socketEvents.startPlaying, roomsData.get(room));
}

io.on(socketEvents.connection, client => {
    logger(`connection`, logStates.DEBUG);
    logger(Array.from(specificRooms), logStates.DEBUG);
    setTimeout(() => client.emit(socketEvents.updateRoomsList, Array.from(specificRooms)), 1000)

    client.on(socketEvents.OnePC, () => {
        logger(socketEvents.OnePC, logStates.INFO);
        const room = uid.rnd();
        client.join(room);
        playersToRoom.set(client.id, room);
        const firstPlayer = Math.floor(Math.random() * 2) + 1;
        roomsData.set(room, {board: Array(42).fill(statusEnum.EMPTY), clientsIds: [client.id], victoryCount: {[statusEnum.SECOND]: 0, [statusEnum.FIRST]: 0}, OnePC: true, firstPlayer});
        client.emit(socketEvents.OnePC, roomsData.get(room));
    })
    
    client.on(socketEvents.playerEnterRandom, ({name}) => {
        logger(`playerEnterRandom ${name}`, logStates.INFO);
        if(playersToRoom.get(client.id)) return;
        logger("playerEnter", logStates.INFO);
        if(!roomWaitingId){
            roomWaitingId = uid.rnd();
            openRoom(client, roomWaitingId, name);
        } else {
            joinRoom(client, roomWaitingId, name);
            roomWaitingId = 0;
        }
    })

    client.on(socketEvents.playerEnterSpecific, ({room, name}) => {
        logger(`playerEnterSpecific ${name}`, logStates.INFO);
        if(!room){
            const newRoomId = uid.rnd();
            specificRooms.add(newRoomId);
            openRoom(client, newRoomId, name);
            client.emit(socketEvents.waitForSpecificRoom, {room: newRoomId});
            io.emit(socketEvents.updateRoomsList, Array.from(specificRooms));
        } else {
            joinRoom(client, room, name);
            specificRooms.delete(room);
            io.emit(socketEvents.updateRoomsList, Array.from(specificRooms));
        }
    })
  
    client.on(socketEvents.playerPlay, ({playerIndex, index}) => {
        const board = roomsData.get(playersToRoom.get(client.id)).board;
        const finalIndex = findFreeSquare(index % 7, board);
        board[finalIndex] = playerIndex;
        roomsData.set(playersToRoom.get(client.id), {...roomsData.get(playersToRoom.get(client.id)), board});

        io.to(playersToRoom.get(client.id)).emit(socketEvents.play, {board, next: !!finalIndex})
        const {isWinner, newBoard} = isThereAWinner(board, playerIndex);
        if(isWinner){
            const victoryCount = roomsData.get(playersToRoom.get(client.id)).victoryCount;
            victoryCount[playerIndex]++;
            roomsData.set(playersToRoom.get(client.id), {...roomsData.get(playersToRoom.get(client.id)), firstPlayer: (roomsData.get(playersToRoom.get(client.id)).firstPlayer % 2) + 1, victoryCount, board: newBoard});
            io.to(playersToRoom.get(client.id)).emit(socketEvents.winner, { playerIndex, board: newBoard })
        }
    })

    client.on(socketEvents.rematch, () => {
        const roomData = roomsData.get(playersToRoom.get(client.id));
        if(roomData.OnePC){
            roomsData.set(playersToRoom.get(client.id), {...roomData, board: Array(42).fill(statusEnum.EMPTY)});
            client.emit(socketEvents.rematch, roomsData.get(playersToRoom.get(client.id)));
        } else if(roomData.rematch){
            roomsData.set(playersToRoom.get(client.id), {...roomData, rematch: false});
            io.to(playersToRoom.get(client.id)).emit(socketEvents.rematch, roomData);
        } else {
            roomsData.set(playersToRoom.get(client.id), {...roomData, board: Array(42).fill(statusEnum.EMPTY), rematch: true});
            client.emit(socketEvents.waitForRematch);
        }
    })

    client.on(socketEvents.message, ({message, player}) => {
        const room = playersToRoom.get(client.id);
        const messages = roomsData.get(room).messages;
        messages.push({player, message});
        roomsData.set(room, {...roomsData.get(room), messages});
        io.to(room).emit(socketEvents.message, { messages: roomsData.get(room).messages})
    })

    client.on(socketEvents.disconnect, () => {
        const roomId = playersToRoom.get(client.id);

        if(roomId){     
            if(roomId === roomWaitingId){
                roomWaitingId = 0;
            }else {
                io.to(roomId).emit(socketEvents.playerLeft);
                const clientsIds = roomsData.get(roomId).clientsIds;
                clientsIds.forEach(id => {
                    playersToRoom.delete(id);
                });
                if(specificRooms.has(roomId)){
                    specificRooms.delete(roomId);
                    io.emit(socketEvents.updateRoomsList, Array.from(specificRooms));
                }
            }
            roomsData.delete(roomId);
        }
    });
});

server.listen(port, () => {
    console.log(`server is running at port: ${port}`)
});