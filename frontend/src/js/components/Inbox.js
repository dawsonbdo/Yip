import React, { Component } from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard from './ReviewCard';
import YipNavBar from "./YipNavBar";
import Message from './Message';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';

import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import { setAllUsers, isLoggedIn, updateLoggedInState, updateLoggedInUserAndWebSocket } from './BackendHelpers.js';

import axios from 'axios';

class Inbox extends Component {
    constructor(props) {
        super(props);

        // Creates state to keep track of if logged in
        this.state = { 
            loggedIn: false,
            inputElem: null,
            messages: null, 
            ws: null,
            user: "",
            recipient: "",
            allUsers: [],
            pastUsers: []
        };

        this.createHTMLMessage = this.createHTMLMessage.bind(this);
        this.loadMessages = this.loadMessages.bind(this);
    }

    // After component is loaded, update auth state
    componentDidMount() {

        // Updates logged in state of the component
        updateLoggedInState(this);

        // Sets user that is logged in and open web socket
        updateLoggedInUserAndWebSocket(this);

        // Set allUsers field by making call to server
        setAllUsers(this);


        var token = localStorage.getItem('jwtToken');

        // Set past users by getting list 
        axios({
            method: 'get',
            url: '/get_past_recipients/' + token
        }).then(response => {

            if ( response.data == undefined || response.data.length == 0 ){
                alert('No past messages in inbox');
                return;
            }

            var users = [];

            for ( var i = 0; i < response.data.length; i++ ){
                users.push({name: response.data[i].user});
            }

            console.log("ALL USERS MESSAGED");
            console.log(users);

            alert('Past users you have messaged loaded');
            this.setState({pastUsers: users});
           
        }).catch(error => {

            // Failed to dislike review
            alert('Past messages failed to load');

        });
    }

    loadMessages(){
        // Get token and recipient
        var token = localStorage.getItem('jwtToken');
        var recipient = document.getElementById('recipient').value;

        // Set states (claer the curent messages)
        let messages = document.querySelector('.messages');
        messages.innerHTML = "";
        this.setState({ messages: messages});
        this.setState({ recipient: recipient });

        // Send GET request
        axios({
            method: 'get',
            url: '/load_messages/' + token + '/' + recipient,
        }).then(response => {

            if ( response.data == undefined || response.data.length == 0 ){
                alert('No messages from ' + recipient);
                return;
            }

            alert('Msgs sucessfuly received from ' + recipient);

            for ( var i = response.data.length-1; i >= 0; i-- ){
                console.log(response.data[i]);
                if (response.data[i].is_sender){
                    this.createHTMLMessage(response.data[i].text, 'client');
                } else {
                    this.createHTMLMessage(response.data[i].text, 'server');
                }
            }
           
        }).catch(error => {

            // Failed to dislike review
            alert('Msgs unsuccessfuly received');

        });
    }

    createHTMLMessage(msg, source){
        var li = document.createElement("li");
        var div = document.createElement("div");
        li.classList.add('inboxli');
        div.innerHTML += msg;
        div.className += "messageInstance " + source;
        li.appendChild(div);
        let messages = this.state.messages;
        messages.appendChild(li);
        this.setState({ messages: messages });
    }

    render() {

        return (
            <div>
                <YipNavBar />
                <Jumbotron id="jumbotron" className="text-center">
                    <h1>Inbox: </h1>
                    <Autocomplete
                      id="recipient"
                      options={this.state.allUsers}
                      getOptionLabel={(option) => option.name}
                      style={{ width: 300 }}
                      renderInput={(params) => <TextField {...params} label="Recipient" variant="outlined" />}
                    />
                    <Button onClick={this.loadMessages} className="logInEntry" type="submit" variant="primary">Load Messages</Button>
                </Jumbotron>
                <div>
                    <div class="mainApp">
                        <h1> Chat App </h1>
                        <ul class="messages"></ul>
                        <input class="chatMessage" />
                    </div>
                </div>
            </div>
        )
    }
}

export default Inbox;