import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import likeIcon from '../../assets/like.png';
import dislikeIcon from '../../assets/dislike.png';

import { likeDislikeCommentJson } from './BackendHelpers.js';

import axios from 'axios'

class CommentCard extends Component {
    constructor(props){
        super(props);
    
        this.like = this.like.bind(this);
        this.dislike = this.dislike.bind(this);
    }

    like(){
        // TODO: Get uuid of comment from a prop probably
        var commentId = "e7c31945-f06f-4f10-ae28-8e9dbe65c5e9";

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

            alert('Comment successfully liked');


        }).catch(error => {

            // Failed to dislike review
            alert('Comment like failed');

        });
    }

    dislike(){
         // TODO: Get uuid of comment from a prop probably
        var commentId = "e7c31945-f06f-4f10-ae28-8e9dbe65c5e9";

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

            alert('Comment successfully disliked!');


        }).catch(error => {

            // Failed to dislike review
            alert('Comment dislike failed');

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
                                                <h4 className="text-left pt-2 pl-2"><a class="profileLink" href={`/user-${this.props.commenterName}`}>{this.props.commenterName}</a></h4>
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
                                                <Image onClick={this.like} className="float-left likePadding" src={likeIcon} />
                                                <Image onClick={this.dislike} className="float-left likePadding" src={dislikeIcon} />
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
    timestamp: PropTypes.string.isRequired
}