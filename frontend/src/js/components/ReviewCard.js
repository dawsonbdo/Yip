import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';

import homeIcon from '../../assets/home.png';
import likeIcon from '../../assets/like.png';
import dislikeIcon from '../../assets/dislike.png';
import commentIcon from '../../assets/comment.png';

import axios from 'axios'

import { likeDislikeReviewJson } from './BackendHelpers.js';

class ReviewCard extends Component {

    constructor(props) {
        super(props)

        this.state = {
            rating: 0,
            isLiked: false,
            isDisliked: false
        }

        // Binds button handler
        this.likeReview = this.likeReview.bind(this);
        this.dislikeReview = this.dislikeReview.bind(this);
    }

    componentDidMount() {
        this.setState({
            rating: this.props.rating,
            isLiked: this.props.isLiked,
            isDisliked: this.props.isDisliked
        })
    }

    dislikeReview() {
        // TODO: Get uuid of review from url probably
        //var reviewId = "92b516fd-775a-41d8-9462-df94840c9a5d";
        var reviewId = this.props.reviewId;

        // Get token
        var token = localStorage.getItem('jwtToken');

        // Create form for request
        var form = likeDislikeReviewJson(reviewId, token);

        // Send POST request
        axios({
            method: 'post',
            url: '/dislike_review',
            data: form
        }).then(response => {

            //alert('Review successfully disliked!');
            // If already disliked removes dislike
			if(this.state.isDisliked) {
				this.setState({ isDisliked: false, rating: this.state.rating + 1 });
			}

			// If liked remove like and add dislike
			else if(this.state.isLiked) {
				this.setState({ isLiked: false, isDisliked: true, rating: this.state.rating - 2 });
			}

			// Otherwise add dislike
			else {
				this.setState({ isDisliked: true, rating: this.state.rating - 1 });
			}


        }).catch(error => {

            // Failed to dislike review
            alert('Review dislike failed');

        });
    }

    likeReview() {
        // TODO: Get uuid of review from url probably
        //var reviewId = "92b516fd-775a-41d8-9462-df94840c9a5d";
        var reviewId = this.props.reviewId;

        // Get token
        var token = localStorage.getItem('jwtToken');

        // Create form for request
        var form = likeDislikeReviewJson(reviewId, token);

        // Send POST request
        axios({
            method: 'post',
            url: '/like_review',
            data: form
        }).then(response => {

            //alert('Review successfully liked!');
            // If already liked removes like
			if(this.state.isLiked) {
				this.setState({ isLiked: false, rating: this.state.rating - 1 });
			}

			// If disliked remove dislike and add like
			else if(this.state.isDisliked) {
				this.setState({ isDisliked: false, isLiked: true, rating: this.state.rating + 2 });
			}

			// Otherwise add like
			else {
				this.setState({ isLiked: true, rating: this.state.rating + 1 });
			}


        }).catch(error => {

            // Failed to like review
            alert('Review like failed');

        });
    }

    render() {
        let likeIconOpacity;
		let dislikeIconOpacity;
		if(this.state.isLiked) {
			likeIconOpacity = {opacity: 1.0};
		}
		else {
			likeIconOpacity = {opacity: .6};
		}
		if(this.state.isDisliked) {
			dislikeIconOpacity = {opacity: 1.0};
		}
		else {
			dislikeIconOpacity = {opacity: .6};
		}
        return (
            <Container className="pb-5">
                <Row>
                    <Col></Col>

                    <Col xs={10} className="text-center">
                        <div className="logInForm">
                                <div className="logInLabel">
                                    <Container>
                                        <Row>
                                            <Col>
                                                <h4 className="text-left pt-2 pl-2"><a class="profileLink" href={`/review-${this.props.reviewId}`}>{this.props.reviewName}</a></h4>
                                            </Col>
                                            <Col>
                                                <h4 className="text-right pt-2 pl-2"><a class="profileLink" href={`/user-${this.props.reviewerName}`}>{this.props.reviewerName}</a></h4>
                                            </Col>
                                        </Row>
                                    </Container>
                                </div>
                                <Form className="logInEntryContainer">
                                    <div className="logInEntryContainer">
                                        <p dangerouslySetInnerHTML={this.props.reviewPreview}></p>
                                    </div>
                                </Form>
                                <div className="bottomLabel">
                                    <Container>
                                        <Row>
                                            <Col>
                                                <Link><Image onClick={this.likeReview} style={likeIconOpacity} className="float-left likePadding" width="45" src={likeIcon} /></Link>
                                                <h4 className="float-left likePadding">{this.state.rating}</h4>
                                                <Link><Image onClick={this.dislikeReview} style={dislikeIconOpacity} className="float-left likePadding" width="45" src={dislikeIcon} /></Link>
                                                <Link to={`/review-${this.props.reviewId}`}><Image className="float-right" width="40" src={commentIcon} style={{opacity: .7}}/></Link>
                                                <Link to={`/kennel-${this.props.kennelName}`}><Image className="float-right" width="40" src={homeIcon} style={{opacity: .8}}/></Link>
                                            </Col>
                                        </Row>
                                    </Container>
                                </div>
                       </div>
                    </Col>

                    <Col></Col>
                 </Row>
            </Container>
        )
    }
}

export default ReviewCard

ReviewCard.propTypes = {
    reviewName: PropTypes.string.isRequired,
    reviwerName: PropTypes.string.isRequired,
    reviewPreview: PropTypes.string.isRequired
}