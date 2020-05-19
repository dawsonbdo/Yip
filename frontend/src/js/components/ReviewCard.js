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

        // Binds button handler
        this.likeReview = this.likeReview.bind(this);
        this.dislikeReview = this.dislikeReview.bind(this);
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

            alert('Review successfully disliked!');


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

            alert('Review successfully liked!');


        }).catch(error => {

            // Failed to like review
            alert('Review like failed');

        });
    }

    render() {
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
                                                <Image onClick={this.likeReview} className="float-left likePadding" width="45" src={likeIcon} />
                                                <h4 className="float-left likePadding">{this.props.rating}</h4>
                                                <Image onClick={this.dislikeReview} className="float-left likePadding" width="45" src={dislikeIcon} />
                                                <Link to={`/review-${this.props.reviewId}`}><Image className="float-right" width="40" src={commentIcon} /></Link>
                                                <Link to={`/kennel-${this.props.kennelName}`}><Image className="float-right" width="40" src={homeIcon} /></Link>
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