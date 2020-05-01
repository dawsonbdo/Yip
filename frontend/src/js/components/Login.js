import React, { Component } from 'react';
import {Link} from 'react-router-dom';

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
            <div className="logInForm">
              <h1 className="logInLabel">Log In</h1>
              <Form className="logInEntryContainer">
                <div className="logInEntryContainer">
                  <Form.Control id="login" className="logInEntry" type="email" placeholder="Username/Email" />
                </div>
                <div className="logInEntryContainer">
                  <Form.Control id="password" className="logInEntry" type="password" placeholder="Password" />
                </div>
                <div>
                  <Form.Text className="text-muted">Forgot Password</Form.Text>
                </div>
                <div className="logInEntryContainer">
                  <Button onClick={this.attemptLogin} className="logInEntry" variant="primary" type="submit">Submit</Button>
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