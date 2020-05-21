import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import corgiImage from '../../assets/corgi_shadow.png';
import { Redirect } from 'react-router-dom';
import Toast from 'react-bootstrap/Toast';
import Spinner from 'react-bootstrap/Spinner';


import axios from 'axios'

import { createUserJson } from './BackendHelpers.js';

class Login extends Component {

  constructor(props) {
    super(props);

    this.state = {
      redirect: null,
      validated: false,
      showPopup: false,
      loading: false,
    };

    // Binds button handler
    this.attemptLogin = this.attemptLogin.bind(this);
  }

  /**
   * Function handler for login submit button
   */
  attemptLogin(event) {

    // Prevents page from refreshing on submit
    event.preventDefault();
    event.stopPropagation();

    this.setState({ failedLogin: false });

    var registerForm = event.currentTarget;

    // Displays error if fields are empty
    if (registerForm.checkValidity() === false) {
      this.setState({ validated: true });
      return;
    }
    this.setState({ loading: true });

    // Parses login form with username/email and password
    var email = document.getElementById('login').value;
    var username = document.getElementById('login').value;
    var password = document.getElementById('password').value
    var form = createUserJson(username, email, password);

    // Send POST request with username, email, and password
    axios({
      method: 'post',
      url: '/login',
      data: form
    }).then(response => {

      // Store token in local storage
      localStorage.setItem('jwtToken', response.data);

      // Redirect to home after successful login
      this.setState({ redirect: "/" });
      

    }).catch(error => {

      // Error for failed login
      this.setState({ failedLogin: true, showPopup: true, loading: false});
    });
  }

  render() {
    let loading = <div></div>;
    if(this.state.loading) {
      loading = <Spinner className="logInEntryContainer" animation="border" size="sm"></Spinner>;
    }

    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    }
    else {
      return (
        <Container>
          <Row className="align-items-center">
            <Col></Col>
            <Col className="text-center">
              <Link to="/"><img src={corgiImage} /></Link>

              <Toast className="mx-auto smallPopup" onClose={() => this.setState({showPopup: false})} show={this.state.showPopup} autohide>
					        <Toast.Header className="smallPopup">
						        <strong className="mr-auto">Username or Password incorrect!</strong>
					        </Toast.Header>
				      </Toast>

              <div className="logInForm">
                <h1 className="logInLabel">Log In</h1>
                <Form noValidate validated={this.state.validated} onSubmit={this.attemptLogin} className="logInEntryContainer">
                  <div className="logInEntryContainer">
                    <Form.Control id="login" className="logInEntry" type="text" placeholder="Username/Email" required />
                    <Form.Control.Feedback type="invalid">Enter username/email.</Form.Control.Feedback>
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Control id="password" className="logInEntry" type="password" placeholder="Password" required />
                    <Form.Control.Feedback type="invalid">Enter password.</Form.Control.Feedback>
                  </div>
                  <div>
                    <Link to="/recoverpassword"><Button variant="link">Forgot Password?</Button></Link>
                  </div>
                  <div className="logInEntryContainer">
                    <Button className="logInEntry" type="submit" variant="primary">
                      <div>Submit</div>
                      {loading}
                    </Button>
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

}

export default Login;