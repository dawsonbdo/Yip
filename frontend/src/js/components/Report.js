import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import corgiImage from '../../assets/corgi_shadow.png';
import { Redirect } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';

import axios from 'axios'

import { createUserJson } from './BackendHelpers.js';

class Profile extends Component {

    constructor(props) {
        super(props);

        this.state = {
            redirect: null,
            validated: false,
			kennel: ""
        };

        // Binds button handler
        this.reportReview = this.reportReview.bind(this);
    }

    /**
     * Function handler for login submit button
     */
    reportReview(event) {
        // Prevents page from refreshing on submit
        event.preventDefault();
        event.stopPropagation();

        var registerForm = event.currentTarget;

        // Displays error if fields are empty
        if (registerForm.checkValidity() === false) {
            this.setState({ validated: true });
            return;
        }

        // Get fields to create Report to pass as data
        var kennel_name = this.state.kennel
        var is_comment = false;
        var comment_id = "";
        var review_id = this.props.match.params.id;
        var reason = "test"; //TODO
        var escalated = false; //TODO
        var token = localStorage.getItem('jwtToken');

        // Create form for request 
        var form = reportJson(kennel_name, is_comment, comment_id, review_id, reason, escalated, token);

        // Send POST request
        axios({
            method: 'post',
            url: '/create_report',
            data: form
        }).then(response => {

            alert('Review successfully reported!');

            this.setState({ redirect: "/" });

        }).catch(error => {

            // Failed to dislike review
            alert('Review report failed');

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
                                <h1 className="logInLabel">Report Reason</h1>
                                <Form noValidate validated={this.state.validated} onSubmit={this.reportReview} className="logInEntryContainer">
                                    <div className="logInEntryContainer">
                                        <Form.Control className="logInEntry" as="textarea" placeholder="Write your reason here." required />
                                        <Form.Control.Feedback type="invalid">Reason needed</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Button className="logInEntry" type="submit" variant="primary" >Submit</Button>
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

export default Profile;