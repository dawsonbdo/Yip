import React, { Component } from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard from './ReviewCard';
import YipNavBar from "./YipNavBar";
import Message from './Message';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { isLoggedIn, updateLoggedInState } from './BackendHelpers.js';

import axios from 'axios';

class Inbox extends Component {
    constructor(props) {
        super(props);

        // Creates state to keep track of if logged in
        this.state = { loggedIn: false };
    }

    // After component is loaded, update auth state
    componentDidMount() {

        // Updates logged in state of the component
        updateLoggedInState(this);
    }

    // Displays if logged in on home page
    componentDidUpdate() {


        // Load reviews
        axios({
            method: 'post',
            url: '/load_reviews',
            data: localStorage.getItem('jwtToken')
        }).then(response => {

            // alert('Listed reviews');

            // TODO: Populate ReviewCards using response.data (this is an array of DisplayReview objs)
            //       (check backend/src/reviews/handlers.rs for the fields of a DisplayReview)

            // Iterate through reviews
            for (var i = 0; i < response.data.length; i++) {

                // Print reviews to console for now
                console.log(response.data[i]);

            }

        }).catch(error => {

            // Review not found in database
            alert('Failed to list reviews');

        });

    }

    render() {

        return (
            <div>
                <YipNavBar />
                <Jumbotron id="jumbotron" className="text-center">
                    <h1>Inbox: </h1>
                </Jumbotron>
                <Container>
                    <Row>
                        <Col>
				            <Message commenterName={"Name"} commentText={"Comment"} />
				            <Message commenterName={"Name"} commentText={"Comment"} />
				            <Message commenterName={"Name"} commentText={"Comment"} />
				            <Message commenterName={"Name"} commentText={"Comment"} />
				            <Message commenterName={"Name"} commentText={"Comment"} />
				            <Message commenterName={"Name"} commentText={"Comment"} />
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default Inbox;