import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard from './ReviewCard';
import YipNavBar from "./YipNavBar";
import Message from './Message';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import InboxUser from './InboxUser';

import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import TimeAgo from 'timeago-react'; // var TimeAgo = require('timeago-react');

import { setAllUsers, isLoggedIn, updateLoggedInState, updateLoggedInUserAndWebSocket, getDateTime } from './BackendHelpers.js';

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
            pastUsers: [],
            userMessages: new Map(),
            userSeen: new Map()
        };

        this.displayHTMLMessage = this.displayHTMLMessage.bind(this);
        this.displayMessages = this.displayMessages.bind(this);
        this.loadPastUsers = this.loadPastUsers.bind(this);
        this.loadAllMessages = this.loadAllMessages.bind(this);
        this.newLiveMessage = this.newLiveMessage.bind(this);
        this.newMessageHandler = this.newMessageHandler.bind(this);
        this.updateSeen = this.updateSeen.bind(this);
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

        // Load all of the past users        
        this.loadPastUsers(token);

        // Load all of messages from the token
        this.loadAllMessages(token);
    
    }

    newMessageHandler(){
        // Get recipient
        var recipient = document.getElementById('recipient').value;
     
        // Check if recipient already in list
        let pastUsers = this.state.pastUsers;
        if ( !pastUsers.includes(recipient) ){
            // Add to list
            pastUsers.unshift(recipient);
            this.setState({pastUsers: pastUsers});

            // Update message display
            let messages = document.querySelector('.messages');
            messages.innerHTML = "";
            this.setState({ messages: messages});
            this.setState({ recipient: recipient });

        } else {
            // Show the past messages
            this.displayMessages(recipient);
        }
    }

    /**
     * Method called whenever client sends a message or receives a live message
     * @param recipient: optional, only provide if source is client
     */
    newLiveMessage(msg, source, recipient=""){
        // Parse the message into sender + msg
        var idx = msg.indexOf('-');
        var sender = msg.substring(0, idx);
        var parsedMsg = msg.substring(idx+1, msg.length);

        // Add message to list 
        let t = Date.UTC();

        console.log(t);
        let msgObj = {is_sender: (source != 'server'), text: parsedMsg, timestamp: t};

        // Get current messages with sender
        let userMessages = this.state.userMessages;
        let curMsgs = userMessages.get(sender);

        if ( curMsgs == undefined ){
            // No messages preivously between the user and person, new list
            userMessages.set(sender, [msgObj]);
        } else {
            // Previous messages, append to it
            curMsgs.push(msgObj);
            userMessages.set(sender, curMsgs)
        }

        // Update state of messges
        this.setState({userMessages: userMessages});

        // Check if client or source
        if ( source == 'server' ){
            // Check if new sender
            let pastUsers = this.state.pastUsers;
            var senderIdx = pastUsers.indexOf(sender);
            if ( senderIdx == -1 ){
                // Add to list if not
                pastUsers.unshift(sender);
            } else {

                // Update index if not at the front already
                if ( senderIdx != 0 ){
                    pastUsers.splice(senderIdx, 1);
                    pastUsers.unshift(sender);
                }
            }

            // Update past users
            this.setState({pastUsers: pastUsers});

            // If client not currently messaging sender, don't render the message
            if ( !this.state.recipient != sender ){
                // Set seen to false
                let userSeen = this.state.userSeen;
                userSeen.set(sender, false);
                this.setState({userSeen: userSeen});
                return;
            }

            // Update seen
            this.updateSeen(sender);

        } else {
            // Check if new recipient
            let pastUsers = this.state.pastUsers;
            var recipientIdx = pastUsers.indexOf(recipient);
            if ( recipientIdx == -1 ){
                // Add to list if not
                pastUsers.unshift(recipient);
            } else {

                // Update index if not at the front already
                if ( senderIdx != 0 ){
                    pastUsers.splice(recipientIdx, 1);
                    pastUsers.unshift(recipient);
                }
            }

            // Update past users
            this.setState({pastUsers: pastUsers});

            // Update seen
            this.updateSeen(recipient);
        }

        console.log('DISPLAY ATTEMPT');

        // Display the message
        this.displayHTMLMessage(msg, source, msgObj.timestamp, this.state.recipient);

        console.log('DISPLAY GOOD');
    }

    loadPastUsers(token){
        // Set past users by getting list 
        axios({
            method: 'get',
            url: '/get_past_recipients/' + token
        }).then(response => {

            if ( response.data == undefined || response.data.length == 0 ){
                alert('No past users messaged ');
                return;
            }

            var users = [];

            for ( var i = 0; i < response.data.length; i++ ){
                users.push(response.data[i].user);
            }

            console.log(users);
            this.setState({pastUsers: users});
            alert('Past users you have messaged loaded');
           
        }).catch(error => {

            // Failed to dislike review
            alert('Past messages failed to load');

        });
    }

    loadAllMessages(token){
        // Get all of the messages
        axios({
            method: 'get',
            url: '/load_all_messages/' + token
        }).then(response => {

            if ( response.data == undefined || response.data.length == 0 ){
                alert('No past messages in inbox');
                return;
            }

            let userMessages = new Map();
            let userSeen = new Map();

            // Iterate through each UserMessage object (user + messages)
            for ( var i = 0; i < response.data.length; i++ ){

                // Get user and messages and seen
                var user = response.data[i].user;
                var msgs = response.data[i].messages;
                var seen = response.data[i].seen;

                // Append to array
                userMessages.set(user, msgs);
                userSeen.set(user, seen);
   
            }

            console.log("ALL USER MESSAGES");
            console.log(userMessages);

            this.setState({userMessages: userMessages});
            this.setState({userSeen: userSeen});

            // Display messages if props valid
            if (this.props.location.state != undefined){
                this.setState({recipient: this.props.location.state.recipient});
                this.displayMessages(this.props.location.state.recipient);
            }

            alert('All past messages loaded');

           
        }).catch(error => {

            // Failed to dislike review
            alert('All past messages failed to load');

        });
    }

    displayMessages(recipient){

        // Print seen stuff
        console.log("SEEN LIST");
        console.log(this.state.userSeen);

        // Update seen
        this.updateSeen(recipient);

        // If not a past user, add to list
        let pastUsers = this.state.pastUsers;
        if ( !pastUsers.includes(recipient) ){
            // Add to list
            pastUsers.unshift(recipient);
            this.setState({pastUsers: pastUsers});
        } 

        // Set states (clear the curent messages)
        let messages = document.querySelector('.messages');
        messages.innerHTML = "";
        this.setState({ messages: messages});
        this.setState({ recipient: recipient });

        // Get all the messages with recipient
        let msgs = this.state.userMessages.get(recipient);

        // Check if undefined meaning none
        if ( msgs == undefined ){
            alert("No messages with: " + recipient);
            return;
        }

        // Render all of the messages with recipients
        for ( var i = 0; i < msgs.length; i++ ){
            if (msgs[i].is_sender){
                this.displayHTMLMessage(this.state.user + "-" + msgs[i].text, 'client', msgs[i].timestamp);
            } else {
                this.displayHTMLMessage(recipient + "-" + msgs[i].text, 'server', msgs[i].timestamp, recipient);
            }
        }

    }

    updateSeen(sender){
        // If sender is user, don't do anything
        if ( sender == this.state.user ){
            return;
        }

        // Check if already seen
        let userSeen = this.state.userSeen;
        let seen = userSeen.get(sender);

        // If new user, update database 
        if ( seen == undefined ){

            // TODO: Make database calls to update seen field of msgs
            // where user is recipient and sender is sender

        } else if ( !seen ){ // Not seen yet, update database

            // Update state of userSeen

        } else { // Seen, 

            // Just update DB

        }

        // Update DB
        // Set past users by getting list 
        axios({
            method: 'post',
            url: '/update_seen/' + localStorage.getItem('jwtToken') + '/' + sender
        }).then(response => {

            if ( response.data == undefined || response.data.length == 0 ){
                alert('Seen updated in db');
                return;
            }

            var users = [];

            for ( var i = 0; i < response.data.length; i++ ){
                users.push(response.data[i].user);
            }

            console.log(users);
            this.setState({pastUsers: users});
            alert('Messages seen status updated in db');
           
        }).catch(error => {

            // Failed to dislike review
            alert('Seen update failed');

        });

        // Update state to show true
        userSeen.set(sender, true);
        this.setState({userSeen: userSeen});
    }

    displayHTMLMessage(msg, source, timestamp="", recipient=""){
        // Parse the message into sender + msg
        var idx = msg.indexOf('-');
        var sender = msg.substring(0, idx);
        var parsedMsg = msg.substring(idx+1, msg.length);

        // If source is server only add to messages if its from current recipient
        if (source == "server"){
            console.log("server source: " + msg);

            // Don't create HTML msg if sender not recipient
            if (sender != recipient){

                // TODO: add it to chat preview for that user
                console.log("SENDER NOT RECIPIENT")
                return;
            }

        }

        var li = document.createElement("li");
        var div = document.createElement("div");
        var timeDiv = document.createElement("div");
        li.classList.add('inboxli');
        div.innerHTML += parsedMsg;
        div.className += "messageInstance " + source;
        li.appendChild(div);
        li.appendChild(timeDiv);
        let messages = document.querySelector('.messages');
        messages.appendChild(li);
        this.setState({ messages: messages });
        if (source == 'server'){
           ReactDOM.render(<TimeAgo style={{position: "relative", padding: "10px", left: "-225px", bottom: "30px"}}
                                        datetime={(new Date(timestamp)).toString()}/>, timeDiv); 
        } else {
            ReactDOM.render(<TimeAgo style={{padding: "10px"}}
                                        className={"float-right"}
                                        datetime={(new Date(timestamp)).toString()}/>, timeDiv); 
        }
        

    }

    render() {

        let that = this;

        let users = this.state.pastUsers.map(function (user) {
            return <InboxUser userName={user} onUserChange={that.displayMessages} userSeen={that.state.userSeen} />
        });

        return (
            <div>
                <YipNavBar />
                <Jumbotron id="jumbotron" className="text-center">
                    <h1>Inbox: </h1>
                    <Autocomplete
                      id="recipient"
                      options={this.state.allUsers}
                      getOptionLabel={(option) => option.name}
                      style={{ width: 300, marginLeft: 'auto', marginRight: 'auto'  }}
                      renderInput={(params) => <TextField {...params} label="Recipient" variant="outlined" />}
                    />
                    <Button onClick={this.newMessageHandler} className="logInEntry" type="submit" variant="primary">New Message</Button>
                </Jumbotron>
                <section class="container">
                  <div class="left-half">
                    <article>
                        <div>
                            <ul class="userlist">
                                {users}
                            </ul>
                        </div>
                    </article>
                  </div>
                  <div class="right-half">
                    <article>
                        <div class="chatApp">
                            <h1> <a class="profileLink" href={`/user-${this.state.recipient}`}>{this.state.recipient}</a> </h1>
                            <ul class="messages"></ul>
                            <input class="chatMessage" />
                        </div>
                    </article>
                  </div>
                </section>
            </div>
        )
    }
}

export default Inbox;