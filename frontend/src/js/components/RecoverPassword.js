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

        // Check if any fields empty/passwords same
        if (email === "" || username === "" || password === "" || confirmPassword === "") {
            alert("Empty fields.");
            return;
        }
        if (password != confirmPassword) {
            alert("Passwords don't match.");
            return;

        }

        this.setState({ redirect: "/login" }); // delete later

        // Send POST request with username, email, and password
        axios({
            method: 'post',
            url: '/recoverpassword',
            data: form
        }).then((response) => {

            // TODO: Redirect to login screen if successful
            if (response.data) {

                this.setState({ redirect: "/login" });

            } else {

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
                    <Row className="align-items-center">
                        <Col></Col>
                        <Col className="text-center">
                            <Link to="/"><img src={corgiImage} /></Link>
                            <div className="logInForm">
                                <h1 className="logInLabel">Recover Password</h1>
                                <Form className="logInEntryContainer">
                                    <div className="logInEntryContainer">
                                        <Form.Control id="username" className="logInEntry" placeholder="Username" />
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="email" className="logInEntry" type="email" placeholder="Email" />
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="password" className="logInEntry" type="password" placeholder="Password" />
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="confirmPassword" className="logInEntry" type="password" placeholder="Password" />
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Button onClick={this.recoverPassword} className="logInEntry">Submit</Button>
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