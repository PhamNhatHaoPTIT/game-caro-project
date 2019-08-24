import * as actionTypes from './ActionType';
import axios from 'axios'
import Connection from '../websocket/Connection'

const connection = new Connection();


export const createSocket = () =>{
    connection.sendAuthentication();
}

export const addUserInfor = (user) =>{
    return{
        type: actionTypes.ADD_USER_INFOR,
        user: user
    }
}


export const createNewRoom = (roomInfor) =>{
    if(roomInfor.host === JSON.parse(localStorage.getItem('userInfor')).username)
     {   connection.sendCreateRoom(roomInfor);
     }
    return{
        type: actionTypes.CREATE_NEW_ROOM,
        roomInfor: roomInfor
    }
}

export const createListRoom = (roomInfor) =>{
    return{
        type: actionTypes.CREATE_LIST_ROOM,
        roomInfor: roomInfor
    }
}

export const deleteRoom = (roomInfor) =>{
    console.log("room infor "+JSON.stringify(roomInfor))
    return{
        type: actionTypes.DELETE_ROOM,
        roomInfor: roomInfor,
    }
}


export const joinRoom = (roomInfor) =>{
    connection.sendJoinRoom(roomInfor);

    console.log("room join "+JSON.stringify(roomInfor))    
    return{
        type: actionTypes.JOIN_ROOM,
        roomInfor: roomInfor
    }
}

export const createGameUserInfor = (gameUserInfor) =>{
    return{
        type: actionTypes.CREATE_GAME_USER_INFOR,
        gameUserInfor: gameUserInfor,
    }
}


export const playTurn = (turnInfor) =>{
    connection.sendPlayGame(turnInfor);
    return{
        type: actionTypes.PLAY_TURN,
        boardGame: turnInfor,
    }
}

export const createResultGame = (resultGame) =>{
    return{
        type: actionTypes.CREATE_RESULT_GAME,
        boardGame: resultGame,
    }
}


export const createMessage = (chatMessageInfor) =>{
    console.log("chat message "+JSON.stringify(chatMessageInfor))  
    connection.sendChatMessage(chatMessageInfor);  
    return{
        type: actionTypes.CREATE_MESSAGE,
        chatMessage: chatMessageInfor,
    }
}

export const sendResultGame = (result) =>{
    connection.sendResultGame(result);
}



