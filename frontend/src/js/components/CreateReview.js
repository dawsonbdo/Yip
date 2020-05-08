import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import ImageUploader from 'react-images-upload';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import corgiImage from '../../assets/corgi_shadow.png';
import likeIcon from '../../assets/like.png';
import dislikeIcon from '../../assets/dislike.png'

import axios from 'axios' 

import { createUserJson } from './BackendHelpers.js';

class CreateReview extends Component {

//   constructor(props){
//     super(props);

//     // Binds button handler
//     this.attemptLogin = this.attemptLogin.bind(this);
//   }

//   /**
//     * Function handler for login submit button
//     */ 
//   attemptLogin(){

//     // Parses login form with username/email and password
//     var email = document.getElementById('login').value;
//     var username = document.getElementById('login').value;
//     var password = document.getElementById('password').value
//     var form = createUserJson(username, email, password);

//     // TODO: Check if any fields empty?

//     // Send POST request with username, email, and password
//     axios({
//       method: 'post',
//       url: '/login',
//       data: form
//     }).then((response) => {
      
//       // If successfully logged in, set access token
//       if ( !(response.data == "loginfail") ){

//         // Store token in local storage
//         localStorage.setItem('jwtToken', response.data);

//       } else {

//         // TODO: Indicate failed login

//       }
      
//     });
//   }

  constructor(props) {
    super(props);
    this.state = { pictures: [] };
    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(picture) {
    this.setState({
      pictures: this.state.pictures.concat(picture)
    });
  }

  render() {
    return (
      <Container fluid>
        <Row className="align-items-center">
          <Col></Col>
          <Col className="text-center">
            <Link to="/"><img src={corgiImage} /></Link>
            <div className="logInForm">
              <h1 className="logInLabel">Create Review</h1>
              <Form className="logInEntryContainer">
                <div className="logInEntryContainer">
                  <Form.Control id="login" className="logInEntry" size="lg" type="text" placeholder="Title" />
                </div>
                <div className="logInEntryContainer">
                  <Form.Control id="password" className="logInEntry" size="lg" as="textarea" placeholder="Enter Review Description" />
                </div>
                <div className="logInEntryContainer">
                  <ImageUploader withIcon={false} withPreview={true} buttonText='Upload Image' onChange={this.onDrop} imgExtension={['.jpg', '.png']} maxFileSize={5242880} label={'Max File Size: 5MB File Types: jpg, png'}/>
                </div>
                <div>
                  <Link><Button variant="link">Forgot Password?</Button></Link>
                </div>
                <div className="logInEntryContainer">
                  <Button onClick={this.attemptLogin} className="logInEntry" variant="primary">Submit</Button>
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

export default CreateReview;