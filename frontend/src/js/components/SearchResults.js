import React, { Component } from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard from './ReviewCard';
import YipNavBar from "./YipNavBar";
import CommentCard from './CommentCard';
import Container from 'react-bootstrap/Container';
import LoadingIcon from '../../assets/loadingIcon.gif';
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { isLoggedIn, updateLoggedInState } from './BackendHelpers.js';

import axios from 'axios'

class SearchResults extends Component {
    constructor(props) {
        super(props);

        // Creates state to keep track of if logged in
        this.state = { 
            loggedIn: false,
            searchDisplay: false
        };
    }


    // Displays if logged in on home page
    componentDidMount() {


        // Load reviews
        axios({
            method: 'post',
            url: '/load_reviews',
            data: localStorage.getItem('jwtToken')
        }).then(response => {


            // TODO: Populate ReviewCards using response.data (this is an array of DisplayReview objs)
            //       (check backend/src/reviews/handlers.rs for the fields of a DisplayReview)

            // Iterate through reviews
            for (var i = 0; i < response.data.length; i++) {

                // Print reviews to console for now
                console.log(response.data[i]);

            }

            this.setState({searchDisplay: true});

        }).catch(error => {

            // Review not found in database
            alert('Failed to list reviews');

        });

    }

    render() {

        // DYNAMICALLY GET REVIEWS HERE AND PUT IT IN THE IF STATEMENT BELOW

        let search;
        if (this.state.searchDisplay) {
            search = 
                <div>
                    <Jumbotron id="jumbotron" className="text-center">
                        <h1>Results: </h1>
                    </Jumbotron>
                    <Container>
                        <Row>
                            <Col>
                                <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={{ __html: "dasfasdfasdf" }} />
                                <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={{ __html: "dasfasdfasdf" }} />
                                <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={{ __html: "dasfasdfasdf" }} />
                                <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={{ __html: "dasfasdfasdf" }} />
                                <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={{ __html: "dasfasdfasdf" }} />
                            </Col>
                            <Col>
                                <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={{ __html: "dasfasdfasdf" }} />
                                <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={{ __html: "dasfasdfasdf" }} />
                                <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={{ __html: "dasfasdfasdf" }} />
                                <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={{ __html: "dasfasdfasdf" }} />
                                <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={{ __html: "dasfasdfasdf" }} />
                            </Col>
                        </Row>
                    </Container>
                </div>
        } else {
            search =
                <Row>
                    <Image className="mx-auto loadingIcon loading" src={LoadingIcon}></Image>
                </Row>;
        }

        return (
            <div>
                <YipNavBar />
                {search}
            </div>
        )
    }
}

export default SearchResults;