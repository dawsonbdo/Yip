import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import Spinner from 'react-bootstrap/Spinner';
import { Redirect } from 'react-router-dom';
import corgi from '../../assets/corgi_shadow.png';
import axios from 'axios';
import { createUserJson } from './BackendHelpers.js';

class Register extends Component {

    constructor(props) {
        super(props);

        this.state = {
            validated: false,
            redirect: null,
            showPopup: null,
            loading: false,
        };

        this.attemptRegistration = this.attemptRegistration.bind(this);
    }

    /**
     * Function handler for registration submit button
     */
    attemptRegistration(event) {

        // Prevents page from refreshing on submit
        event.preventDefault();
        event.stopPropagation();

        var registerForm = event.currentTarget;

        // Display error if fields empty or email invalid
        if (registerForm.checkValidity() === false) {
            this.setState({ validated: true });
            return;
        }

        // User login form with email, username, and password
        var email = document.getElementById('email').value;
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        var repassword = document.getElementById('repassword').value;
        var form = createUserJson(username, email, password);

        // Check that email and username don't contain whitespace or other unaccepted characters
        var regex = /^[A-Za-z0-9_]+$/;
        var isValidUsername = regex.test(username);
        if (!isValidUsername) {
            this.setState({ showPopup: "Username can only contain letters, numbers, and underscores!" });
            return;
        }

        // Check that passwords match
        if (password !== repassword) {
            this.setState({ showPopup: 'Passwords do not match!' });
            return;
        }

        if (password.length < 8) {
            this.setState({ showPopup: 'Password must be at least 8 characters!' });
            return;
        }

        this.setState({ loading: true });

        // Send POST request with database User json
        axios({
            method: 'post',
            url: '/register',
            data: form
        }).then(response => {

            // Successfuly logged in, store access token
            localStorage.setItem('jwtToken', response.data);

            // Redirect to home after registering
            this.setState({ redirect: "/" });

            this.setState({ showPopup: 'Account successfully created!' });

        }).catch(error => {

            // Username or email already exist
            this.setState({ showPopup: 'Username or Email already registered!', loading: false });

        });
    }

    render() {
        let loading = <div></div>;
        if (this.state.loading) {
            loading = <Spinner className="logInEntryContainer" animation="border" size="sm"></Spinner>;
        }

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

                            <Toast className="mx-auto smallPopup" onClose={() => this.setState({ showPopup: null })} show={this.state.showPopup} autohide>
                                <Toast.Header className="smallPopup">
                                    <strong className="mx-auto">{this.state.showPopup}</strong>
                                </Toast.Header>
                            </Toast>

                            <div className="logInForm">
                                <h1 className="logInLabel"> Sign Up</h1>
                                <Form noValidate validated={this.state.validated} id="form" onSubmit={this.attemptRegistration} className="logInEntryContainer">
                                    <div className="logInEntryContainer">
                                        <Form.Control id="username" className="logInEntry" placeholder="Username" required></Form.Control>
                                        <Form.Control.Feedback type="invalid">Enter username.</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="email" className="logInEntry" placeholder="Email" type="Email" required></Form.Control>
                                        <Form.Control.Feedback type="invalid">Enter valid email.</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="password" className="logInEntry" placeholder="Password" type="Password" required></Form.Control>
                                        <Form.Control.Feedback type="invalid">Enter password.</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="repassword" className="logInEntry" placeholder="Re-Type Password" type="Password" required></Form.Control>
                                        <Form.Control.Feedback type="invalid">Confirm password.</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Link to="/login"><Button variant="link">Already have an account?</Button></Link>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Button className="logInEntry" type="submit">
                                            <div>Submit{loading}</div>
                                        </Button>
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