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
                        <div id="registerForm">
                        <h1 id="signUp"> Sign Up</h1>
                        <Form> 
                            <FormControl placeholder="Username"></FormControl>
                            <FormControl type="email" placeholder="Email"></FormControl>
                            <FormControl type="password" placeholder="Password"></FormControl>
                            <FormControl type="password" placeholder="Re-type Password"></FormControl>
                            <Button type="submit">Submit</Button>
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