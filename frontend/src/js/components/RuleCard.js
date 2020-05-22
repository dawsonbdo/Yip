import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

class RuleCard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Container className="pb-3">
                <Row>
                    <Col></Col>
                    <Col xs={8} className="text-center">
                        <div className="logInForm">
                            <div className="userLabel">
                                <Container>
                                    <Row>
                                        <Col>
                                            <h4 className="text-center pt-2 pl-2">{this.props.rule}</h4>
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

export default RuleCard;

RuleCard.propTypes = {
    rule: PropTypes.string.isRequired,
}