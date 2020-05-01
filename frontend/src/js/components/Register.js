import React, {Component} from 'react';

import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
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
                        <img src={corgi}></img>
                        <div id="logInForm">
                            <h1 id="logInLabel"> Sign Up</h1>
                            <Form id="logInEntryContainer">
                                <div id="logInEntryContainer">
                                    <Form.Control id="logInEntry" placeholder="Username"></Form.Control>
                                </div>
                                <div id="logInEntryContainer">
                                    <Form.Control id="logInEntry" placeholder="Email" type="Email"></Form.Control>
                                </div>
                                <div id="logInEntryContainer">
                                    <Form.Control id="logInEntry" placeholder="Password" type="Password"></Form.Control>
                                </div>
                                <div id="logInEntryContainer">
                                    <Form.Control id="logInEntry" placeholder="Password" type="Password"></Form.Control>
                                </div>
                                <div id="logInEntryContainer">
                                    <Button id="logInEntry" type="submit">Submit</Button>
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