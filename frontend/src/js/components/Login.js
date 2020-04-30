import React, { Component } from 'react';
import {Link} from 'react-router-dom';

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
            <div id="registerForm">
            <h1 id="logInLabel">Log In</h1>
            <Form id>
              <Form.Control type="email" placeholder="Username/Email" />

              <Form.Control type="password" placeholder="Password" />
              <Form.Text className="text-muted text-right">
                <Link to="/"><Button variant="link" className="my-0">Forgot Password</Button></Link>
              </Form.Text>
              <Button variant="primary" type="submit">
                Submit
              </Button>
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