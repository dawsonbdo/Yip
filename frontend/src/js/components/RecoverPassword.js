import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import corgiImage from '../../assets/corgi_shadow.png';
import { Redirect } from 'react-router-dom';
import Toast from 'react-bootstrap/Toast';
import Spinner from 'react-bootstrap/Spinner';

import axios from 'axios';

import { createUserJson } from './BackendHelpers.js';

class RecoverPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            validated: false,
            redirect: null,
            showPopup: false,
            popupMsg: "",
            loading: false
        };
        this.recoverPassword = this.recoverPassword.bind(this);
    }

    /**
      * Function handler for recovering password
      */
    recoverPassword() {
        // Prevents page from refreshing on submit
        event.preventDefault();
        event.stopPropagation();

        var recoverPasswordForm = event.currentTarget;

        // Display error if fields empty or email invalid
        if (recoverPasswordForm.checkValidity() === false) {
            this.setState({ validated: true });
            return;
        }

        // Get the email, username, and password
        var email = document.getElementById('email').value;
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        var confirmPassword = document.getElementById('confirmPassword').value;

        var form = createUserJson(username, email, password);

        // Check if passwords same
        if (password != confirmPassword) {
            this.setState({showPopup: true, popupMsg: "Passwords don't match!"});
            return;
        }

        if (password.length < 8) {
            this.setState({showPopup: true, popupMsg: "Password must be at least 8 characters!"});
            return;
        }

        this.setState({ loading: true });

        // Send POST request with username, email, and password
        axios({
            method: 'post',
            url: '/recover_password',
            data: form
        }).then(response => {

            // TODO: Redirect to login screen if successful
            this.setState({ redirect: "/login" });
            this.setState({ loading: false, showPopup: true, popupMsg: "Password successfully reset!" });
            

        }).catch(error => {

            // Failed recover password
            this.setState({ loading: false, showPopup: true, popupMsg: "Incorrect username or email." });

        })
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
                    <Row className="align-items-center">
                        <Col></Col>
                        <Col className="text-center">
                            <Link to="/"><img src={corgiImage} /></Link>

                            <Toast className="mx-auto smallPopup" onClose={() => this.setState({ showPopup: false })} show={this.state.showPopup} autohide>
                                <Toast.Header className="smallPopup">
                                    <strong className="mx-auto">{this.state.popupMsg}</strong>
                                </Toast.Header>
                            </Toast>

                            <div className="logInForm">
                                <h1 className="logInLabel">Reset Password</h1>
                                <Form noValidate validated={this.state.validated} onSubmit={this.recoverPassword} className="logInEntryContainer">
                                    <div className="logInEntryContainer">
                                        <Form.Control id="username" className="logInEntry" placeholder="Username" required />
                                        <Form.Control.Feedback type="invalid">Enter username.</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="email" className="logInEntry" type="email" placeholder="Email" required />
                                        <Form.Control.Feedback type="invalid">Enter valid email.</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="password" className="logInEntry" type="password" placeholder="New Password" required />
                                        <Form.Control.Feedback type="invalid">Enter a new password.</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="confirmPassword" className="logInEntry" type="password" placeholder="Re-Type Password" required />
                                        <Form.Control.Feedback type="invalid">Confirm new password.</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Button className="logInEntry" type="submit"><div>Submit{loading}</div></Button>
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

}

export default RecoverPassword;