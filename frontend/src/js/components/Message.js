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

import { likeDislikeCommentJson, updateLoggedInState, isLoggedIn } from './BackendHelpers.js';

import axios from 'axios'

class Message extends Component {
    constructor(props) {
        super(props);

        // this.state = {
        //     rating: 0
        // }
    }

    componentDidMount() {
        // this.setState({
        //     rating: this.props.rating,
        // });
        updateLoggedInState(this);
    }

    render() {
        let isComment = this.props.commentBody;
        let redirectUrl = '/review-' + this.props.reviewId;
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
                                            <h4 className="text-left pt-2 pl-2"><a class="profileLink" href={`/user-${this.props.messagerName}`}>{this.props.messagerName}</a></h4>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                            <Form className="logInEntryContainer">
                                <div className="logInEntryContainer">
                                    <h6>Reported Reason:</h6>
                                    <p>{this.props.messageText}</p>
                                    { (isComment !== "") &&
                                        <>
                                        <br />
                                        <h6>Original Comment:</h6>
                                        <p>{this.props.commentBody}</p>
                                        </>
                                    }
                                    { (isComment === "") &&
                                        <>
                                        <br />
                                        <h6>Original Review:</h6>
                                        <Link to={redirectUrl}><p>{this.props.reportTitle}</p></Link>
                                        </>
                                    }
                                </div>
                                <Container>
                                    <Row>
                                        <Col>
                                            <p></p>
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

export default Message;

Message.propTypes = {
    messagerName: PropTypes.string.isRequired,
    messageText: PropTypes.string.isRequired,
    reportTitle: PropTypes.string.isRequired,
    commentBody: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired
}