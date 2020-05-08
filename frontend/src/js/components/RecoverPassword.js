import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import corgiImage from '../../assets/corgi_shadow.png';
import { Redirect } from 'react-router-dom';

import axios from 'axios';

import { createUserJson } from './BackendHelpers.js';

class RecoverPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null
        };
        this.recoverPassword = this.recoverPassword.bind(this);
    }

    /**
      * Function handler for recovering password
      */
    recoverPassword() {
        // Get the email, username, and password
        var email = document.getElementById('email').value;
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        var confirmPassword = document.getElementById('confirmPassword').value;

        var form = createUserJson(username, email, password);

        // Check if passwords same
        if (password != confirmPassword) {
            alert("Passwords don't match.");
            return;

        }

        this.setState({ redirect: "/login" }); // delete later

        // Send POST request with username, email, and password
        axios({
            method: 'post',
            url: '/recover_password',
            data: form
        }).then(response => {

            // TODO: Redirect to login screen if successful
            this.setState({ redirect: "/login" });
            alert("Password successfully reset.");

        }).catch(error => {
            
            // Failed recover password
            alert("Incorrect Username or Email.");

        })
    }

    render() {
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
                            <div className="logInForm">
                                <h1 className="logInLabel">Reset Password</h1>
                                <Form onSubmit={this.recoverPassword} className="logInEntryContainer">
                                    <div className="logInEntryContainer">
                                        <Form.Control id="username" className="logInEntry" placeholder="Username" required/>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="email" className="logInEntry" type="email" placeholder="Email" required/>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="password" className="logInEntry" type="password" placeholder="New Password" required/>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="confirmPassword" className="logInEntry" type="password" placeholder="Re-Type Password" required/>
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
            )

        }
    }

}

export default RecoverPassword;