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

        this.state = {
            reviews: true,
            rules: false,
            tags: false
        }

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(eventKey) {

        if (eventKey == "reviews") {
            this.setState({ reviews: true, rules: false, tags: false });
        }
        if (eventKey == "rules") {
            this.setState({ reviews: false, rules: true, tags: false });
        }
        if (eventKey == "tags") {
            this.setState({ reviews: false, rules: false, tags: true });
        }
    }


    render() {
        return (
            <div>
                <Container>
                    <Row className="align-items-center">
                        <Col className="text-center">
                            <Jumbotron id="jumbotron" className="text-left">
                                <h1>{this.props.kennelName}</h1>
                                <Nav onSelect={this.handleSelect} defaultActiveKey="reviews" variant="tabs" as="ul">
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="reviews">Reviews</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="rules">Rules</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item as="li">
                                        <Nav.Link eventKey="tags">Tags</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Jumbotron>
                        </Col>
                        <Col>
                            <Link to="/editkennel"><Button className="logInEntry" variant="link">Edit Kennel</Button></Link>
                            <Button className="logInEntry" type="submit" variant="primary">Follow</Button>
                        </Col>
                    </Row>
                    {this.state.reviews && (
                        <div>
                            <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                            <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                            <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                            <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                            <ReviewCard reviewName={"Review Name"} reviewerName={"Name"} reviewPreview={"dasfasdfasdf"} />
                        </div>
                    )}
                    {this.state.rules && (
                        <div>
                            <h1>Rules</h1>
                            <p>Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary                                
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary                                
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary                                
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary                                
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary                                
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary                                
                            Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary Gary                                
                            </p>
                        </div>
                    )}
                    {this.state.tags && (
                        <div>
                            <h1>Tags</h1>
                            <p>#gary #gary #gary #gary #gary #gary #gary #gary #gary #gary #gary
                            #gary #gary #gary #gary #gary #gary #gary #gary #gary #gary #gary
                            #gary #gary #gary #gary #gary #gary #gary #gary #gary #gary #gary
                            </p>
                        </div>
                    )}
                </Container>
            </div>
        )
    }

}

export default Kennel;

Kennel.propTypes = {
    kennelName: PropTypes.string.isRequired,
};