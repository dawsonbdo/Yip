import React, { Component } from 'react';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import corgiImage from '../../assets/corgi_shadow.png';

import axios from 'axios' 

class Login extends Component {

  constructor(props){
    super(props);
    this.attemptLogin = this.attemptLogin.bind(this);
  }

  attemptLogin(){
    // Function that formats a form to be sent in POST request
    const formUrlEncoded = x => Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')

    // User login form with username/email and password
    var login = document.getElementById('login').value;
    var password = document.getElementById('password').value
    var form = {login: login, password: password};

    // Send POST request with username and password
    axios({
      method: 'post',
      url: '/login',
      data: formUrlEncoded(form),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
  }

  render() {
    return (
      <Container>
        <Row className="align-items-center">
          <Col></Col>
          <Col className="text-center">
            <img src={corgiImage} />
            <div id="logInForm">
              <h1 id="logInLabel">Log In</h1>
              <Form>
                <Form.Control id='login' type="email" placeholder="Username/Email" />

                <Form.Control id='password' type="password" placeholder="Password" />
                <Form.Text className="text-muted">
                  Forgot Password
              </Form.Text>
                <Button onClick={this.attemptLogin} variant="primary" type='submit'>
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