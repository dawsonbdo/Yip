import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import likeIcon from '../../assets/like.png';
import dislikeIcon from '../../assets/dislike.png';
import reportIcon from '../../assets/report.png';
import trashIcon from '../../assets/trash.png';

import { likeDislikeCommentJson, updateLoggedInState, isLoggedIn } from './BackendHelpers.js';

import axios from 'axios'

class CommentCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLiked: false,
            isDisliked: false,
            rating: 0
        }

        this.like = this.like.bind(this);
        this.dislike = this.dislike.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
    }

    componentDidMount() {
        this.setState({
            rating: this.props.rating,
            isLiked: this.props.isLiked,
            isDisliked: this.props.isDisliked
        });
        updateLoggedInState(this);

    }

    deleteComment() {

        var token = localStorage.getItem('jwtToken');

        // Create form for request
        var form = {
            comment_uuid: this.props.commentId,
            token: token,
        };;

        var url = '/remove_comment/' + this.props.kennel;

        // Send POST request
        axios({
            method: 'post',
            url: url,
            data: form
        }).then(response => {

            this.props.rerenderReview(this.props.commentIndex);

        }).catch(error => {

            // Failed to dislike review
            alert('Comment removal failed');

        });

    }

    like() {

        if (this.props.loggedIn) {
            // If already liked removes like
            if (this.state.isLiked) {
                this.setState({ isLiked: false, rating: this.state.rating - 1 });
            }

            // If disliked remove dislike and add like
            else if (this.state.isDisliked) {
                this.setState({ isDisliked: false, isLiked: true, rating: this.state.rating + 2 });
            }

            // Otherwise add like
            else {
                this.setState({ isLiked: true, rating: this.state.rating + 1 });
            }
        }
        else {
            this.props.handleInvalidLike();
            return;
        }

        // TODO: Get uuid of comment from a prop probably
        var commentId = this.props.commentId;

        // Get token
        var token = localStorage.getItem('jwtToken');

        // Create form for request
        var form = likeDislikeCommentJson(commentId, token);

        var url = '/like_comment';

        // Send POST request
        axios({
            method: 'post',
            url: url,
            data: form
        }).then(response => {

            //alert('Comment successfully liked');

        }).catch(error => {

            // Failed to dislike review
            alert('Comment like failed');

        });
    }

    dislike() {

        if (this.props.loggedIn) {
            // If already disliked removes dislike
            if (this.state.isDisliked) {
                this.setState({ isDisliked: false, rating: this.state.rating + 1 });
            }

            // If liked remove like and add dislike
            else if (this.state.isLiked) {
                this.setState({ isLiked: false, isDisliked: true, rating: this.state.rating - 2 });
            }

            // Otherwise add dislike
            else {
                this.setState({ isDisliked: true, rating: this.state.rating - 1 });
            }

        }
        else {
            this.props.handleInvalidLike();
            return;
        }

        // TODO: Get uuid of comment from a prop probably
        var commentId = this.props.commentId;

        // Get token
        var token = localStorage.getItem('jwtToken');

        // Create form for request
        var form = likeDislikeCommentJson(commentId, token);

        var url = '/dislike_comment';


        // Send POST request
        axios({
            method: 'post',
            url: url,
            data: form
        }).then(response => {

            //alert('Comment successfully disliked!');

        }).catch(error => {

            // Failed to dislike review
            alert('Comment dislike failed');

        });
    }

    render() {
        let likeIconOpacity;
        let dislikeIconOpacity;
        let reportOpacity;
        if (this.state.isLiked) {
            likeIconOpacity = { opacity: 1.0, cursor: 'pointer' };
        }
        else {
            likeIconOpacity = { opacity: .6, cursor: 'pointer' };
        }
        if (this.state.isDisliked) {
            dislikeIconOpacity = { opacity: 1.0, cursor: 'pointer' };
        }
        else {
            dislikeIconOpacity = { opacity: .6, cursor: 'pointer' };
        }
        if (this.props.isReported) {
            reportOpacity = { opacity: 1.0, cursor: 'pointer' };
        }
        else {
            reportOpacity = { opacity: .6, cursor: 'pointer' };
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
                                            <h4 className="text-left pt-2 pl-2"><a class="profileLink"
                                                href={`/user-${this.props.commenterName}`}>{this.props.commenterName}</a></h4>
                                        </Col>
                                        <Col>
                                            {(this.props.isAuthor || this.props.isModerator) && <Image onClick={this.deleteComment} style={{ cursor: 'pointer' }}
                                                className="likePadding float-right" src={trashIcon} width="50" />}
                                            {(this.props.loggedIn && !this.props.isAuthor) &&
                                                <Link to={{
                                                    pathname: '/report',
                                                    state: {
                                                        is_comment: true,
                                                        comment_id: this.props.commentId,
                                                        kennel_name: this.props.kennel,
                                                        review_id: this.props.review
                                                    }
                                                }}><Image style={reportOpacity} className="likePadding float-right" src={reportIcon} width="50" /></Link>}
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                            <Form className="logInEntryContainer">
                                <div className="logInEntryContainer">
                                    <p>{this.props.commentText}</p>
                                </div>
                                <Container>
                                    <Row>
                                        <Col>
                                            <Image onClick={this.like} style={likeIconOpacity} className="float-left likePadding" width="45" src={likeIcon} />
                                            <h4 className="float-left likePadding">{this.state.rating}</h4>
                                            <Image onClick={this.dislike} style={dislikeIconOpacity} className="float-left likePadding" width="45" src={dislikeIcon} />
                                        </Col>
                                        <Col>
                                            <p className="float-right timestamp">Posted on {this.props.timestamp.substring(5, 16)}</p>
                                        </Col>
                                    </Row>
                                </Container>
                            </Form>
                        </div>
                    </Col>

                    <Col></Col>
                </Row>
            </Container>
        )
    }
}

export default CommentCard;

CommentCard.propTypes = {
    commenterName: PropTypes.string.isRequired,
    commentText: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    isModerator: PropTypes.bool.isRequired
}