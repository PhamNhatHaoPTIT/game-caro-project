import React, { Component } from 'react';
import 'antd/dist/antd.css';
import {  Card } from 'react-bootstrap';
import UserInfor from './UserInfor'
import {connect} from "react-redux"

class GameInfor extends Component{

    render(){
        return(
            
        <Card  className="game-infor" >
            <Card.Header>
                {this.props.canGo===true? "Your turn" : "Wait to your turn"}
            </Card.Header>
            <Card.Body>
                <Card className="bet-point">Bet point: {this.props.bet_point} p</Card>
                <UserInfor 
                    username={this.props.host}
                    src={"https://i.pinimg.com/564x/0e/f3/88/0ef388a7c15a72578a8bdaef6665696a.jpg"}>

                </UserInfor>
                <UserInfor 
                    username={this.props.guest}
                        src={"https://i.pinimg.com/564x/81/a2/54/81a2541db762d74e3c753e17c5960eeb.jpg"}>

                </UserInfor>

            </Card.Body>
        </Card>
         
        )
    }
}

function mapStateToProps(state){
    return{
        canGo: state.boardGame.canGo,
        host : state.gameUserInfor.host,
        guest: state.gameUserInfor.guest,
        bet_point: state.gameUserInfor.bet_point,
    }
}


export default connect(mapStateToProps)(GameInfor)


