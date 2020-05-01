import React, { Component } from 'react';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import corgiImage from '../../assets/corgi_shadow.png';

class Login extends Component {

  render() {
    return (
      <Container>
        <Row className="align-items-center">
          <Col></Col>

          <Col className="text-center">
            <img src={corgiImage} />
            <div id="logInForm">
              <h1 id="logInLabel">Log In</h1>
              <Form id="logInEntryContainer">
                <div id="logInEntryContainer">
                  <Form.Control id="logInEntry" type="email" placeholder="Username/Email" />
                </div>
                <div id="logInEntryContainer">
                  <Form.Control id="logInEntry" type="password" placeholder="Password" />
                </div>
                <div>
                  <Form.Text className="text-muted">Forgot Password</Form.Text>
                </div>
                <div id="logInEntryContainer">
                  <Button id="logInEntry" variant="primary" type="submit">Submit</Button>
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

export default Login;