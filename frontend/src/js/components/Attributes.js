import React, { Component } from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard from './ReviewCard';
import YipNavBar from "./YipNavBar";
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import LoadingIcon from '../../assets/loadingIcon.gif';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import KennelCard from './KennelCard';

import { isLoggedIn, updateLoggedInState, updateLoggedInUser } from './BackendHelpers.js';

import axios from 'axios'

class Attributes extends Component {

    render() {
        return (
            <div>
                <YipNavBar />
                <Container className="my-auto">
                    <Row>
                        <Col></Col>
                        <Col xs={10} className="text-center">
                            <Jumbotron id="jumbotron">
                                <h1>Attributed Icons:</h1>
                            </Jumbotron>
                                <p>
                                    <a href="https://freeicons.io/app-icons/inbox-icon-19191#">Inbox Icon made by DotFix Technologies at freeicons.io</a>
                                </p>
                                <p>
                                    <a href="https://freeicons.io/material-icons-action/home-icon-15944#">Home Icon made by icon king at freeicons.io</a>
                                </p>
                                <p>
                                    <a href="https://freeicons.io/common-style-icons-9/like-icon-11769#">Like Icon made by icon king at freeicons.io</a>
                                </p>
                                <p>
                                    <a href="https://freeicons.io/common-style-icons-9/like-icon-11769#">Dislike Icon made by icon king at freeicons.io</a>
                                </p>
                                <p>
                                    <a href="https://freeicons.io/arrow-icons/arrow-share-icon-icon#">Arrow Share Icon made by Raj Dev at freeicons.io</a>
                                </p>
                                <p>
                                    <a href="https://freeicons.io/material-icons-actions/report-problem-icon-8541#">Report Icon made by Free Preloaders at freeicons.io</a>
                                </p>
                                <p>
                                    <a href="https://freeicons.io/business-and-online-icons/bookmark-icon-icon-4#">Bookmark Icon made by Raj Dev at freeicons.io</a>
                                </p>
                                <p>
                                    <a href="https://freeicons.io/essentials-free-ui-icons/trash-icon-12186">Trash Icon made by Raj Dev at freeicons.io</a>
                                </p>
                                <p>
                                    <a href="https://freeicons.io/ecommerce-icons/edit-icon-icon">Edit Icon made by icon king at freeicons.io</a>
                                </p>
                            <div className="text-left">
                                <Link to="/">Go back Home</Link>
                            </div>
                        </Col>
                        <Col>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default Attributes;