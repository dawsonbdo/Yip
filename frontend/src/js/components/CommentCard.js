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
    
        this.likeClick = this.likeClick.bind(this);
    }

    likeClick(id){
        // TODO: Get uuid of comment from a prop probably
        var commentId = "e7c31945-f06f-4f10-ae28-8e9dbe65c5e9";

        // Get token
        var token = localStorage.getItem('jwtToken');

        // Create form for request
        var form = likeDislikeCommentJson(commentId, token);

        var url;

        // Check id to get url
        if ( id.equals('like') ){
            url = '/like_comment';
        } else {
            url = '/dislike_comment';
        }


        // Send POST request
        axios({
            method: 'post',
            url: url,
            data: form
        }).then(response => {

            alert('Comment successfully liked or disliked!');


        }).catch(error => {

            // Failed to dislike review
            alert('Comment like/dislike failed');

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
                                                <h4 className="text-left pt-2 pl-2">{this.props.commenterName}</h4>
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
                                                <Link to="/"><Image id="like" onClick={this.likeDislike(this.id)} className="float-left likePadding" src={likeIcon} /></Link>
                                                <Link to="/"><Image id="dislike" onClick={this.likeDislike(this.id)} className="float-left likePadding" src={dislikeIcon} /></Link>
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