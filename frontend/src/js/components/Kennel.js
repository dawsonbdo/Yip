import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import Form from 'react-bootstrap/Form';
import ReviewCard from './ReviewCard';
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
            reviews: true,
            rules: false,
            tags: false
        }

        this.handleSelect = this.handleSelect.bind(this);
        this.followKennel = this.followKennel.bind(this);
    }

    handleSelect(eventKey) {

        if (eventKey == "reviews") {
            this.setState({ reviews: true, rules: false, tags: false });
        }
        if (eventKey == "rules") {
            this.setState({ reviews: false, rules: true, tags: false });
        }
        if (eventKey == "tags") {
            this.setState({ reviews: false, rules: false, tags: true });
        }
    }

    followKennel(){

        // Get kennel name somehow
        var kennelName = 'GaryGang';

        // Get token
        var token = localStorage.getItem('jwtToken');

        console.log("TOKEN: " + token);

        // Create JSON form to send to backend
        var form = followKennelJson(kennelName, token);

        // Send POST request to follow kennel
        axios({
          method: 'post',
          url: '/follow_kennel',
          data: form
        }).then(response => {

          // Store token in local storage
          alert('Kennel has been followed successfully');


        }).catch(error => {

          // Error for failed follow
          alert('Failed to follow kennel');

        });
    }

    componentDidMount(){
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

            alert('Kennel reviews successfully grabbed from database!');

            // TODO: Populate ReviewCards using response.data (this is an array of DisplayReview objs)
            //       (check backend/src/reviews/handlers.rs for the fields of a DisplayReview)
          
            // Iterate through reviews
            for (var i = 0; i < response.data.length; i++ ){

                // Print reviews to console for now
                console.log(response.data[i]);

            } 
        
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

            alert('Kennel info successfully grabbed from database!');

            // TODO: Render kennel information
            console.log(response.data);
        
        }).catch(error => {

            // Review not found in database
            alert('Kennel does not exist in database');

        });
    }

    render() {
        return (
            <div>
                <Container>
                    <Row className="align-items-center">
                        <Col className="text-center">
                            <Jumbotron id="jumbotron" className="text-left">
                                <h1>{this.props.kennelName}</h1>
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
                    {this.state.reviews && (
                        <div>
                            <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                            <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                            <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                            <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                            <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                        </div>
                    )}
                    {this.state.rules && (
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
                    {this.state.tags && (
                        <div>
                            <h1>Tags</h1>
                            <p>#gary #gary #gary #gary #gary #gary #gary #gary #gary #gary #gary
                            #gary #gary #gary #gary #gary #gary #gary #gary #gary #gary #gary
                            #gary #gary #gary #gary #gary #gary #gary #gary #gary #gary #gary
                            </p>
                        </div>
                    )}
                </Container>
            </div>
        )
    }

}

export default Kennel;

Kennel.propTypes = {
    kennelName: PropTypes.string.isRequired,
};