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

class CommentCard extends Component {
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
                                                <Link to="/"><Image className="float-left likePadding" src={likeIcon} /></Link>
                                                <Link to="/"><Image className="float-left likePadding" src={dislikeIcon} /></Link>
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