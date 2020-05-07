import React, {Component} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Jumbotron from "react-bootstrap/Jumbotron";
import YipNavBar from "./YipNavBar";
import CommentCard from './CommentCard';

class Review extends Component {
    render() {
        return (
            <div>
                <YipNavBar />
                <Jumbotron id="jumbotron" className="text-left">
                    <h1>Review Name</h1>
                    <h4>Reviewer Name</h4>
                </Jumbotron>


                <Row className="align-items-center">
                    <Col className="text-center mx-auto">
                        <div className="logInEntry">
                           <h4>testteTESTTESTTESTTESTTESTTESTTTESTSSSSSSSSSSSSSSSSSSSSSSSSSSSSTESTTESTTESTTESTTESTTESTTTESTSSSSSSSSSSSSS SSSSSSSSSSSSSSSsttesttesttestTESTTESTTESTTESTTESTTESTTTESTSSSSSSSSSSSSSSSSSSSSSSSSSSSS</h4>
                        </div>
                        </Col>

                        <Col className="text-right">
                            IMAGE
                        </Col>
                </Row>

                <CommentCard />
                <CommentCard />
                <CommentCard />
            </div>
        );
    }
}

export default Review;