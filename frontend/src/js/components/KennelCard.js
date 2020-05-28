import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

class KennelCard extends Component {
    constructor(props) {
        super(props);
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
                                            <h4 className="text-left pt-2 pl-2"><a class="profileLink" href={`/kennel-${this.props.kennelName}`}>{this.props.kennelName}</a></h4>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                            <Form className="logInEntryContainer">
                                <div className="logInEntryContainer">
                                    <p>Rules: {this.props.kennelRules}</p>
                                    <p>Tags: {this.props.kennelTags}</p>
                                </div>
                            </Form>
                            <div className="bottomLabel">
                                <Container>
                                    <Row>
                                        <Col>
                                            <h4>{this.props.followerCount} Followers</h4>
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

export default KennelCard;

KennelCard.propTypes = {
    kennelName: PropTypes.string.isRequired,
    kennelRules: PropTypes.string.isRequired,
}