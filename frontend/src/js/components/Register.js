import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import { Redirect } from 'react-router-dom';

import corgi from '../../assets/corgi_shadow.png';

import axios from 'axios';

import { createUserJson } from './BackendHelpers.js';

class Register extends Component {

    constructor(props) {
        super(props);

        this.state = { 
            validated: false, 
            redirect: null 
        };

        this.attemptRegistration = this.attemptRegistration.bind(this);
    }

    /**
     * Function handler for registration submit button
     */
    attemptRegistration(event) {
        var registerForm = event.currentTarget;
        if (registerForm.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.setState({ validated: true });

        // User login form with email, username, and password
        var email = document.getElementById('email').value;
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        var repassword = document.getElementById('repassword').value;
        var form = createUserJson(username, email, password);

        if (password !== repassword) {
            alert('Passwords do not match!');
            return;
        }

        // Send POST request with database User json
        axios({
            method: 'post',
            url: '/register',
            data: form
        }).then((response) => {

            // If successfully logged in, set access token
            if (!(response.data == "loginfail")) {

                // Store token in local storage
                localStorage.setItem('jwtToken', response.data);
                
                this.setState({ redirect: "/login" });
            } else {
                alert('Username or Email already registered!');
            }
        });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        else {
            return (
                <Container>
                    <Row>
                        <Col></Col>

                        <Col className="text-center">
                            <Link to="/"><img src={corgi}></img></Link>
                            <div className="logInForm">
                                <h1 className="logInLabel"> Sign Up</h1>
                                <Form id="form" onSubmit={this.attemptRegistration} className="logInEntryContainer">
                                    <div className="logInEntryContainer">
                                        <Form.Control id="username" className="logInEntry" placeholder="Username" required></Form.Control>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="email" className="logInEntry" placeholder="Email" type="Email" required></Form.Control>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="password" className="logInEntry" placeholder="Password" type="Password" required></Form.Control>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="repassword" className="logInEntry" placeholder="Re-Type Password" type="Password" required></Form.Control>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Button className="logInEntry" type="submit">Submit</Button>
                                    </div>
                                </Form>
                            </div>
                        </Col>

                        <Col></Col>
                    </Row>
                </Container>
            );
        }
    }
}

export default Register