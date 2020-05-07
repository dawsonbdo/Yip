import React, {Component} from 'react';
import {Link} from 'react-router-dom';

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

class ReviewCard extends Component {
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
                                                <h4 className="text-left pt-2 pl-2">Review</h4>
                                            </Col>
                                            <Col>
                                                <h4 className="text-right pt-2 pl-2">ReviewerName</h4>
                                            </Col>
                                        </Row>
                                    </Container>
                                </div>
                                <Form className="logInEntryContainer">
                                    <div className="logInEntryContainer">
                                        <p>akjahjakjhflkahkljfalkjfhkahfjak
                                            djahdkjakldakljdkjakjahlkdjakljdhakj
                                            adhakjdlajkdkjahkdhadhad
                                            ahskjlfahskjfakjlhflkajhkljgajga
                                        </p>
                                    </div>
                                </Form>
                                <div className="bottomLabel">
                                    <Container>
                                        <Row>
                                            <Col>
                                                <Link to="/"><Image className="float-left" src={commentIcon} /></Link>
                                                <Link to="/"><Image className="float-left" src={homeIcon} /></Link>
                                            </Col>
                                            <Col>
                                                <Link to="/"><Image className="float-right" src={likeIcon} /></Link>
                                                <Link to="/"><Image className="float-right" src={dislikeIcon} /></Link>
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