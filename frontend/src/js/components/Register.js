import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import corgi from '../../assets/corgi_shadow.png';

import axios from 'axios';

import { createUserJson } from './BackendHelpers.js';

class Register extends Component {

    constructor(props){
        super(props);
        this.attemptRegistration = this.attemptRegistration.bind(this);
    }

    /**
     * Function handler for registration submit button
     */
    attemptRegistration(){

        // User login form with email, username, and password
        var email = document.getElementById('email').value;
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value
        var form = createUserJson(username, email, password);

        // Send POST request with database User json
        axios({
            method: 'post',
            url: '/register',
            data: form
        }).then((response) => {

            // If successfully logged in, set access token
            if ( !(response.data == "loginfail") ){

                // Store token in local storage
                localStorage.setItem('jwtToken', response.data);

            } else {

                // TODO: Update front end indicating failed register

            }

        });
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col></Col>
               
                    <Col className="text-center">
                        <Link to="/"><img src={corgi}></img></Link>
                        <div className="logInForm">
                            <h1 className="logInLabel"> Sign Up</h1>
                            <Form className="logInEntryContainer">
                                <div className="logInEntryContainer">
                                    <Form.Control id="username" className="logInEntry" placeholder="Username"></Form.Control>
                                </div>
                                <div className="logInEntryContainer">
                                    <Form.Control id="email" className="logInEntry" placeholder="Email" type="Email"></Form.Control>
                                </div>
                                <div className="logInEntryContainer">
                                    <Form.Control id="password" className="logInEntry" placeholder="Password" type="Password"></Form.Control>
                                </div>
                                <div className="logInEntryContainer">
                                    <Form.Control className="logInEntry" placeholder="Password" type="Password"></Form.Control>
                                </div>
                                <div className="logInEntryContainer">
                                    <Button onClick={this.attemptRegistration} className="logInEntry" >Submit</Button>
                                </div>
                            </Form>
                       </div>
                    </Col>

                    <Col></Col>
                 </Row>
            </Container>
        )
    }

    
}

export default Register