import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import Form from 'react-bootstrap/Form';
import ReviewCard from './ReviewCard';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Jumbotron from "react-bootstrap/Jumbotron";
import corgiImage from '../../assets/corgi_shadow.png';
import { Redirect } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';

import axios from 'axios'

import { createUserJson } from './BackendHelpers.js';

class Kennel extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Container>
                    <Row className="align-items-center">
                        <Col className="text-center">
                            <Jumbotron id="jumbotron" className="color-nav">
                                <h1>{this.props.kennelName}</h1>
                                <Nav variant="tabs" as="ul">
                                    <Nav.Item as="li">
                                        <Nav.Link href="link-0">Reviews</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="link-1">Rules</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="link-2">Tags</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Jumbotron>
                        </Col>
                        <Col>
                            <Link to="/editkennel"><Button className="logInEntry" variant="link">Edit Kennel</Button></Link>
                            <Button className="logInEntry" type="submit" variant="primary">Follow</Button>
                        </Col>
                    </Row>
                    <div>
                        <ReviewCard id="c1" reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                        <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                        <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                        <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                        <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                        <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                    </div>
                </Container>
            </div>
        )
    }

}

export default Kennel;

Kennel.propTypes = {
    kennelName: PropTypes.string.isRequired,
};