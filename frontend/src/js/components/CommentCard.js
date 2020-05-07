import React, {Component} from 'react';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
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
                                                <h4 className="text-left pt-2 pl-2">Name of Commenter</h4>
                                            </Col>
                                        </Row>
                                    </Container>
                                </div>
                                <Form className="logInEntryContainer">
                                    <div className="logInEntryContainer">
                                        <p>comment! comment! comment! comment! comment! comment! comment! comment! comment! comment!
                                        </p>
                                    </div>
                                    <Container>
                                        <Row>
                                            <Col>
                                                <h4 className="text-right pt-2 pl-2">Wag/Growl</h4>
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

export default CommentCard