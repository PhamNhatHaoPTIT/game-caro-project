import React, { Component } from 'react';
import 'antd/dist/antd.css';
import './Login.css';
import Api from '../../api/Api'
import { Form, Icon, Input, Button, Card } from 'antd';
import * as indexAction from '../../action/index'
import {connect} from "react-redux"
import { withRouter } from "react-router-dom";


class CardLogin extends Component{
    constructor(props){
        super(props);

        this.state = {
            loginErr : ''
        }
    }

    login(username, password){
        const api = new Api();
        const user ={
            username: username,
            password: password,
        }

        return new Promise((resolve,reject) =>{
            api.post('login',user).then((response)=>{
                localStorage.setItem('userInfor',JSON.stringify(response.data.user))
                localStorage.setItem('token',JSON.stringify(response.data.token))

                // this.props.addUserInfor(response.data.user);

                if(response.status===200){
                    this.props.history.push({
                        pathname: '/',
                      })
                      indexAction.createSocket();
                }

                    
            }).catch((err)=>{
                this.setState({
                    loginErr:"Username or password is not correct"})
                return err;
            })
        })

    }

    handleSubmit = e => {
        this.setState({
            loginErr:''
        })
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
          if (!err) {
            this.login(values.username,values.password);
          }
          else{
            console.log("error "+err)
          }
        });
      };
    
    render(){
        const { getFieldDecorator } = this.props.form;

        return(
            
            <Card title="Login" className="login-card">
                
                <Form onSubmit={this.handleSubmit} className="login-form">
                    
                    <Form.Item>
                        Or <a href="/signup">Create an account!</a>
                    </Form.Item>
                    
                    <Form.Item>
                    {getFieldDecorator('username', {
                        rules: [{ required: true, message: 'Please input your username!' }],
                    })(
                        <Input
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="Username"
                        />,
                    )}
                    </Form.Item>
                    <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [
                            { required: true, message: 'Please input your Password!' },
                        ],
                    })(
                        <Input
                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        type="password"
                        placeholder="Password"
                        />,
                    )}
                    </Form.Item>


                    <div className="login_err">{this.state.loginErr}</div>

                    
                    <Form.Item>

                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Log in
                        </Button>

                    </Form.Item>

                </Form>
          </Card>
         
        )
    }
}

const mapStateToProps = (state) =>{
    return{
        userInfor: state.userInfor,
    }
}

const mapDispatchToProps = (dispatch) =>{
    return{
        addUserInfor: userInfor => dispatch(indexAction.addUserInfor(userInfor))
    }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form.create()(CardLogin)))

