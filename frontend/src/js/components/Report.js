import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import corgiImage from '../../assets/corgi_shadow.png';
import { Redirect } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import Toast from 'react-bootstrap/Toast';
import axios from 'axios';
import { reportJson } from './BackendHelpers.js';

class Profile extends Component {

    constructor(props) {
        super(props);

        this.state = {
            redirect: null,
            validated: false,
            reviewFrom: {},
            loading: false,
            showPopup: false,
            popupMsg: ""
        };

        // Binds button handler
        this.reportReview = this.reportReview.bind(this);
    }

    componentDidMount() {
        //const { handle } = this.props.match.params;
        const reviewState = this.props.location.state;

        // fetch(`localhost:8000/kennel-${handle}`)
        //   .then((kennel) => {
        //     this.setState(() => ({ kennel }))
        //   })
        let msg;
        if (reviewState.is_comment) {
            msg = "Comment already reported!";
        } else {
            msg = "Review already reported!";
        }
        this.setState({ popupMsg: msg });
        this.setState({ reviewFrom: reviewState });
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

        this.setState({ loading: true });

        // Get fields to create Report to pass as data
        var kennel_name = this.state.reviewFrom.kennel_name;
        var is_comment = this.state.reviewFrom.is_comment;
        var comment_id = this.state.reviewFrom.comment_id;
        if (is_comment) {
            var review_id = "";
        }
        else {
            var review_id = this.state.reviewFrom.review_id;
        }
        var reason = document.getElementById('reason').value;
        var escalated = false; //TODO
        var token = localStorage.getItem('jwtToken');

        console.log(kennel_name);
        console.log(review_id);
        console.log(reason);
        console.log(comment_id);
        console.log(is_comment);
        // Create form for request 
        var form = reportJson(kennel_name, is_comment, comment_id, review_id, reason, escalated, token);

        // Send POST request
        axios({
            method: 'post',
            url: '/create_report',
            data: form
        }).then(response => {


            let redirectUrl = "/review-" + this.state.reviewFrom.review_id;
            this.setState({ redirect: redirectUrl });

        }).catch(error => {

            // Failed to dislike review
            //let redirectUrl = "/review-" + this.state.reviewFrom.review_id;
            //this.setState({ redirect: redirectUrl });
            this.setState({ loading: false, showPopup: true });

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
                                <h1 className="logInLabel">Report Reason</h1>
                                <Form noValidate validated={this.state.validated} onSubmit={this.reportReview} className="logInEntryContainer">
                                    <div className="logInEntryContainer">
                                        <Form.Control id="reason" className="logInEntry" as="textarea" placeholder="Write your reason here." required />
                                        <Form.Control.Feedback type="invalid">Reason needed.</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Button className="logInEntry" type="submit" variant="primary"><div>Submit{loading}</div></Button>
                                        <Button className="logInEntry" onClick={this.props.history.goBack} variant="primary">Cancel</Button>
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