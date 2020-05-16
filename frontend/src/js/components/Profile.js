import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Jumbotron from "react-bootstrap/Jumbotron";
import Image from 'react-bootstrap/Image';
import YipNavBar from "./YipNavBar";
import LoadingIcon from '../../assets/loadingIcon.gif';
import CommentCard from './CommentCard';
import commentIcon from '../../assets/comment.png';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import likeIcon from '../../assets/like.png';
import dislikeIcon from '../../assets/dislike.png';
import Nav from 'react-bootstrap/Nav';
import ReviewCard from './ReviewCard';
import ImageUploader from 'react-images-upload';
import corgiImage from '../../assets/corgi_shadow.png';

import axios from 'axios'

import { createCommentJson, followUserJson } from './BackendHelpers.js';

class Profile extends Component {

    constructor(props) {
        super(props)

        this.state = {
            username: "",
            showReviews: true,
            showRules: false,
            reviewArray: [],
            kennelArray: [],
            profileReviewsListed: false,
            profileKennelsListed: false,
            isOwner: false,
            followBtnText: "Follow",
            isFollowing: false
        }

        this.handleSelect = this.handleSelect.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.followProfile = this.followProfile.bind(this);
        this.blockProfile = this.blockProfile.bind(this);
    }

    followProfile() {
        // Load user profile (get from URL)
        var username = this.props.match.params.username;

        var token = localStorage.getItem('jwtToken');

        var form = followUserJson(username, token);

        // Send POST request with user name to follow
        if (!this.state.isFollowing) {
            axios({
                method: 'post',
                url: '/follow_user',
                data: form,
            }).then(response => {

                alert('User successfully followed');
                this.setState({ followBtnText: "Unfollow",
                    isFollowing: true });

            }).catch(error => {

                // Review not found in database
                alert('User failed to follow');

            });
        }
        else {
            axios({
                method: 'post',
                url: '/unfollow_user',
                data: form,
            }).then(response => {
    
                alert('User successfully unfollowed');
                this.setState({ followBtnText: "Follow",
                    isFollowing: false });
    
            }).catch(error => {
    
                // Review not found in database
                alert('User failed to unfollow');
    
            });
        }
    }

    blockProfile() {
        // Load user profile (get from URL)
        var username = this.props.match.params.username;

        var token = localStorage.getItem('jwtToken');

        var form = followUserJson(username, token);

        // Send POST request with user name to follow
        axios({
            method: 'post',
            url: '/block_user',
            data: form,
        }).then(response => {

            alert('User successfully blocked');


        }).catch(error => {

            alert('User failed to block');

        });
    }

    onDrop(picture) {
        this.setState({
            pictures: this.state.pictures.concat(picture)
        });
    }

    handleSelect(eventKey) {

        if (eventKey == "reviews") {
            this.setState({ showReviews: true, showKennels: false });
        }
        if (eventKey == "kennels") {
            this.setState({ showReviews: false, showKennels: true });
        }
    }


    // update this for profile
    componentDidMount() {
        // Load user profile (get from URL)
        var username = this.props.match.params.username;

        // Get token
        var token = localStorage.getItem('jwtToken');

        // Send GET request with user name to get user information
        axios({
            method: 'get',
            url: '/get_user/' + username + '/' + token,
        }).then(response => {

            //alert('User info successfully grabbed from database!');

            // TODO: Render user information
            console.log("USER");
            console.log(response.data);

            this.setState({
                username: response.data.username,
                isOwner: response.data.is_owner,
            });

            if (response.data.is_followed) {
                this.setState({ followBtnText: "Unfollow",
                    isFollowing: true });
            }

            this.setState({ profileKennelsListed: true });

        }).catch(error => {

            // Review not found in database
            alert('User info does not exist in database');

        });

        // Send GET request with user name to get followed kennels
        axios({
            method: 'get',
            url: '/get_followed_kennels_username/' + username,
        }).then(response => {

            //alert('Users followed kennels info successfully grabbed from database!');

            console.log("FOLLOWED KENNELS");
            console.log(response.data);

            // Store names of followed kennels in kennelArray
            for (var i = 0; i < response.data.length; i++) {
                this.state.kennelArray.push(response.data[i].kennel_name);
            }


        }).catch(error => {

            // Review not found in database
            alert('User followed kennels does not exist in database');

        });


        // Send GET request with user name to get reviews posted
        axios({
            method: 'get',
            url: '/get_user_reviews/' + username,
        }).then(response => {

            //alert('Users posted reviews info successfully grabbed from database!');

            console.log("POSTED REVIEWS");
            console.log(response.data);

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

            this.setState({ profileReviewsListed: true });

        }).catch(error => {

            // Review not found in database
            alert('User posted reviews does not exist in database');

        });

    }


    render() {
        const reviews = this.state.reviewArray.map(function (review) {
            return <ReviewCard reviewName={review.title} reviewerName={review.author} reviewPreview={{ __html: review.text }} />
        });
        const kennels = this.state.kennelArray.map(function (kennel) {
            return <a href={`/kennel-${kennel}`}><li>{kennel}</li></a>
        });

        let profile;
        if (this.state.profileKennelsListed && this.state.profileReviewsListed) {
            profile = <Container>
                <Row className="align-items-center">
                    <Col xs={8} className="text-center">
                        <Jumbotron id="jumbotron" className="text-left">
                            <h1>{this.state.username}</h1>
                            <Image id="img" className="profilePic" src={corgiImage} />
                            <Nav onSelect={this.handleSelect} defaultActiveKey="reviews" variant="tabs" as="ul">
                                <Nav.Item as="li">
                                    <Nav.Link eventKey="reviews">Reviews</Nav.Link>
                                </Nav.Item>
                                <Nav.Item as="li">
                                    <Nav.Link eventKey="kennels">Kennels</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Jumbotron>
                    </Col>
                    {!this.state.isOwner && (
                        <Col>
                            <Button className="logInEntry" type="submit" variant="primary">Message</Button>
                            <Button onClick={this.followProfile} className="logInEntry" type="submit" variant="primary">{this.state.followBtnText}</Button>
                            <Button onClick={this.blockProfile} className="logInEntry" type="submit" variant="primary">Block</Button>
                            <Button onClick={this.reportProfile} className="logInEntry" type="submit" variant="primary">Report</Button>
                        </Col>
                    )}
                </Row>
                {this.state.showReviews && (
                    <div>{reviews}</div>
                )}
                {this.state.showKennels && (
                    <div>
                        <h1>Kennels</h1>
                        <ul>
                            {kennels}
                        </ul>
                    </div>
                )}
            </Container>
        } else {
            profile = <Row>
                <Image className="mx-auto loadingIcon loading" src={LoadingIcon}></Image>
            </Row>;
        }

        return (
            <div>
                <YipNavBar />
                {profile}
            </div>
        )
    }
}

export default Profile;
// only allow line 57 button is another reviewer, maybe gray it out and have no action