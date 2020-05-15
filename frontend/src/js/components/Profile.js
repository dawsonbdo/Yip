import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Jumbotron from "react-bootstrap/Jumbotron";
import Image from 'react-bootstrap/Image';
import YipNavBar from "./YipNavBar";
import LoadingIcon from '../../assets/LoadingIcon.gif';
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

import { createCommentJson } from './BackendHelpers.js';

class Profile extends Component {

	constructor(props) {
        super(props)
       
        this.state = {
            kennel_name: "",
            showReviews: true,
            showRules: false,
            reviewArray: [],
            profileReviewsListed: false,
            profileKennelsListed: false
        }

        this.handleSelect = this.handleSelect.bind(this);
        this.onDrop = this.onDrop.bind(this);

    }

    onDrop(picture) {
        this.setState({
          pictures: this.state.pictures.concat(picture)
        });
    }
    
    handleSelect(eventKey) {

        if (eventKey == "reviews") {
            this.setState({ showReviews: true, showKennels: false});
        }
        if (eventKey == "kennels") {
            this.setState({ showReviews: false, showKennels: true });
        }
    }

/* needs to be followUser
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
*/
// update this for profile
    componentDidMount() {
        // Load user profile (get from URL)
        var username = 'Todd_Howard'

        // Send GET request with user name to get user information
        axios({
            method: 'get',
            url: '/get_user/' + username,
        }).then(response => {

            alert('User info successfully grabbed from database!');

            // TODO: Render user information
            console.log("USER");
            console.log(response.data);

            // Updates kennel name
            // this.setState({ kennel_name: response.data.kennel_name });

        }).catch(error => {

            // Review not found in database
            alert('User info does not exist in database');

        });

        // Send GET request with user name to get followed kennels
        axios({
            method: 'get',
            url: '/get_followed_kennels_username/' + username,
        }).then(response => {

            alert('Users followed kennels info successfully grabbed from database!');

            // TODO: Render user information
            console.log("FOLLOWED KENNELS");
            console.log(response.data);

            // Updates kennel name
            // this.setState({ kennel_name: response.data.kennel_name });

        }).catch(error => {

            // Review not found in database
            alert('User followed kennels does not exist in database');

        });


        // Send GET request with user name to get reviews posted
        axios({
            method: 'get',
            url: '/get_user_reviews/' + username,
        }).then(response => {

            alert('Users posted reviews info successfully grabbed from database!');

            // TODO: Render user information
            console.log("POSTED REVIEWS");
            console.log(response.data);

            // Updates kennel name
            // this.setState({ kennel_name: response.data.kennel_name });

        }).catch(error => {

            // Review not found in database
            alert('User posted reviews does not exist in database');

        });




        // TODO: Remove the stuff below this, all the database calls needed
        // are above this








        // Get kennel name from URL?
        var kennelName = 'GaryGang';

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

            this.setState({profileReviewsListed: true});



            // Renders reviews
            this.forceUpdate();

        }).catch(error => {

            // Review not found in database
            // alert('Kennel does not exist/No reviews in kennel');

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
            this.setState({ kennel_name: response.data.kennel_name });

            this.setState({profileKennelsListed: true});

        }).catch(error => {

            // Review not found in database
            alert('Kennel does not exist in database');

        });

    }


    render() {
        // TODO: get this persons reviews from the database
        // possibly same thing for this persons kennels
        const reviews = this.state.reviewArray.map(function (review) {
            return <ReviewCard reviewName={review.title} reviewerName={review.author} reviewPreview={{ __html: review.text }} />
        });

        let profile;
        if (this.state.profileKennelsListed && this.state.profileReviewsListed) {
            profile = <Container>
                <Row className="align-items-center">
                    <Col xs={9} className="text-center">
                        <Jumbotron id="jumbotron" className="text-left">
                            <h1>Todd Howard the Almighty</h1>
                            <ImageUploader withIcon={false} withPreview={true} buttonText='Upload Profile Picture' onChange={this.onDrop} imgExtension={['.jpg', '.png']} maxFileSize={5242880} label={'Max File Size: 5MB File Types: jpg, png'}/>
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
                    <Col>
                        <Button onClick={this.followProfile} className="logInEntry" type="submit" variant="primary">Follow</Button>
                        <Button onClick={this.blockProfile} className="logInEntry" type="submit" variant="primary">Block</Button>
                        <Button onClick={this.reportProfile} className="logInEntry" type="submit" variant="primary">Report</Button>
                    </Col>
                </Row>
                {this.state.showReviews && (
                    <div>{reviews}</div>
                )}
                {this.state.showKennels && (
                    <div>
                        <h1>Kennels</h1>
                        <ul>
                            <li>kennel1</li>
                            <li>kennel2</li>
                            <li>kennel3</li>
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
                <YipNavBar/>
                {profile}
            </div>
        )
    }
}

export default Profile;
// only allow line 57 button is another reviewer, maybe gray it out and have no action