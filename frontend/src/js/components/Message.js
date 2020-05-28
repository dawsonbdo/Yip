import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import trashIcon from '../../assets/trash.png';
import { updateLoggedInState } from './BackendHelpers.js';

import axios from 'axios'

class Message extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isRendered: true
        }

        this.deleteReport = this.deleteReport.bind(this);
    }

    componentDidMount() {
        updateLoggedInState(this);
    }

    deleteReport() {
        // Get review's id
        var reportId = this.props.reportId;
        var kennelName = this.props.kennelName;

        // Get token
        var token = localStorage.getItem('jwtToken');

        // Create form for request
        var reqUrl = '/delete_report/' + reportId + '/' + kennelName + '/' + token;

        // Send POST request
        axios({
            method: 'post',
            url: reqUrl
        }).then(response => {

            //alert('Review successfully removed!');
            this.setState({ isRendered: false });

        }).catch(error => {

            alert('Report removal failed');

        });
    }

    render() {
        let isComment = this.props.commentBody;
        let redirectUrl = '/review-' + this.props.reviewId;
        let rendered = this.state.isRendered;
        return (
            <>
                {rendered &&
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
                                                <Col>
                                                    <Image onClick={this.deleteReport} style={{ cursor: 'pointer' }} className="likePadding float-right" src={trashIcon} />
                                                </Col>
                                            </Row>
                                        </Container>
                                    </div>
                                    <Form className="logInEntryContainer">
                                        <div className="logInEntryContainer">
                                            <h6>Reported Reason:</h6>
                                            <p>{this.props.messageText}</p>
                                            {(isComment !== "") &&
                                                <>
                                                    <br />
                                                    <h6>Original Comment:</h6>
                                                    <p>{this.props.commentBody}</p>
                                                </>
                                            }
                                            {(isComment === "") &&
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
                }
            </>
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