import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import corgi from '../../assets/corgi_shadow.png';



class Register extends Component {
    render() {
        return (
            <Container>
                <Row>
                    <Col></Col>
               
                    <Col className="text-center">
                        <Link to="/"><img src={corgi}></img></Link>
                        <div className="logInForm">
                            <h1 className="logInLabel"> Sign Up</h1>
                            <Form className="logInEntryContainer">
                                <div className="logInEntryContainer">
                                    <Form.Control className="logInEntry" placeholder="Username"></Form.Control>
                                </div>
                                <div className="logInEntryContainer">
                                    <Form.Control className="logInEntry" placeholder="Email" type="Email"></Form.Control>
                                </div>
                                <div className="logInEntryContainer">
                                    <Form.Control className="logInEntry" placeholder="Password" type="Password"></Form.Control>
                                </div>
                                <div className="logInEntryContainer">
                                    <Form.Control className="logInEntry" placeholder="Password" type="Password"></Form.Control>
                                </div>
                                <div className="logInEntryContainer">
                                    <Button className="logInEntry" type="submit">Submit</Button>
                                </div>
                            </Form>
                       </div>
                    </Col>

                    <Col></Col>
                 </Row>
            </Container>
        )
    }

    
}

export default Register