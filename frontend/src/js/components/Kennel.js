import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import Form from 'react-bootstrap/Form';
import ReviewCard from './ReviewCard';
import YipNavBar from './YipNavBar';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Jumbotron from "react-bootstrap/Jumbotron";
import corgiImage from '../../assets/corgi_shadow.png';
import { Redirect } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';

import axios from 'axios'

import { followKennelJson } from './BackendHelpers.js';

class Kennel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            kennel_name: "",
            showReviews: true,
            showRules: false,
            showTags: false,
            reviewArray: [],
            tagsArray: []
        }

        this.handleSelect = this.handleSelect.bind(this);
        this.followKennel = this.followKennel.bind(this);
    }

    handleSelect(eventKey) {

        if (eventKey == "reviews") {
            this.setState({ showReviews: true, showRules: false, showTags: false });
        }
        if (eventKey == "rules") {
            this.setState({ showReviews: false, showRules: true, showTags: false });
        }
        if (eventKey == "tags") {
            this.setState({ showReviews: false, showRules: false, showTags: true });
        }
    }

    followKennel() {

        // Get kennel name somehow
        var kennelName = 'GaryGang';

        // Get token
        var token = localStorage.getItem('jwtToken');

        // Create JSON form to send to backend
        var form = followKennelJson(kennelName, token);

        // Send POST request to follow kennel
        axios({
            method: 'post',
            url: '/follow_kennel',
            data: form
        }).then(response => {

            // Successful follow
            alert('Kennel has been followed successfully');


        }).catch(error => {

            // Error for failed follow
            alert('Failed to follow kennel');

        });
    }

    componentDidMount() {
        // Load kennel page with data from database

        // Get kennel name from URL?
        var kennelName = 'GaryGang'

        // Format URL to send in GET request
        var reqUrl = "/get_reviews/" + kennelName;

        // Send GET request with kennel name to get reviews in kennel
        axios({
            method: 'get',
            url: reqUrl
        }).then(response => {

            //alert('Kennel reviews successfully grabbed from database!');

            // Iterate through reviews
            for (var i = response.data.length - 1; i >= 0; i--) {

                // Print reviews to console for now
                console.log(response.data[i]);

                // Add review name, reviewer's username, review text to reviewArray
                this.state.reviewArray.push({
                    title: response.data[i].title,
                    author: response.data[i].author,
                    text: response.data[i].text
                });

            }

            // Renders reviews
            this.forceUpdate();

        }).catch(error => {

            // Review not found in database
            alert('Kennel does not exist/No reviews in kennel');

        });

        // Format URL to send in GET request
        reqUrl = "/get_kennel/" + kennelName;

        // Send GET request with kennel name to get kennel information
        axios({
            method: 'get',
            url: reqUrl
        }).then(response => {

            // alert('Kennel info successfully grabbed from database!');

            // TODO: Render kennel information
            console.log(response.data);

            // Updates kennel name
            this.setState({ kennel_name: response.data.kennel_name} );

            // Iterate through tags
            for( var i = 0; i < response.data.tags.length; i++) {

                // Add tags to tagsArray
                this.state.tagsArray.push(response.data.tags[i]);
            }

        }).catch(error => {

            // Review not found in database
            alert('Kennel does not exist in database');

        });
    }

    render() {
        const reviews = this.state.reviewArray.map(function(review) {
            return <ReviewCard reviewName={review.title} reviewerName={review.author} reviewPreview={review.text}/>
        });
        const tags = this.state.tagsArray.map(function(tag) {
            return <p>{tag}</p>
        });
        return (
            <div>
                <YipNavBar/>
                <Container>
                    <Row className="align-items-center">
                        <Col xs={9} className="text-center">
                            <Jumbotron id="jumbotron" className="text-left">
                                <h1>{this.state.kennel_name}</h1>
                                <Nav onSelect={this.handleSelect} defaultActiveKey="reviews" variant="tabs" as="ul">
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="reviews">Reviews</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="rules">Rules</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="tags">Tags</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Jumbotron>
                        </Col>
                        <Col>
                            <Link to="/editkennel"><Button className="logInEntry" variant="link">Edit Kennel</Button></Link>
                            <Button onClick={this.followKennel} className="logInEntry" type="submit" variant="primary">Follow</Button>
                        </Col>
                    </Row>
                    {this.state.showReviews && (
                        <div>{reviews}</div>
                    )}
                    {this.state.showRules && (
                        <div>
                            <h1>Rules</h1>
                            <p>Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary
                            </p>
                        </div>
                    )}
                    {this.state.showTags && (
                        <div>
                            <h1>Tags</h1>
                            <p>{tags}</p>
                        </div>
                    )}
                </Container>
            </div>
        )
    }

}

export default Kennel;