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

import { createUserJson, createReviewJson } from './BackendHelpers.js';

class CreateReview extends Component {

  constructor(props) {
    super(props);
    this.state = { pictures: [] };
    this.onDrop = this.onDrop.bind(this);
    this.postReview = this.postReview.bind(this);
  }

  onDrop(picture) {
    this.setState({
      pictures: this.state.pictures.concat(picture)
    });
  }

  postReview(){
    // TODO: Get UTC time or something standard instead of just local time

    // Get date/time of post 
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    // Read information in forms
    var title = document.getElementById('title').value;
    var text = document.getElementById('text').value;
    var user = localStorage.getItem('jwtToken');
    var form = createReviewJson(title, text, user, dateTime);

    // Create form data for POST request and stringify json
    const fd = new FormData();
    fd.append('review', JSON.stringify(form));

    // Iterate through all pictures adding image/name to form
    for ( var idx = 0; idx < this.state.pictures.length; idx++ ){

      // Append current image/name
      fd.append('image', this.state.pictures[idx]);
      fd.append('name', this.state.pictures[idx].name);
    }

    // Send POST request with review multipart
    axios({
        method: 'post',
        url: '/create_review',
        data: fd
    }).then(response => {

        // Successfuly created review
        alert('Review creation success');

        // Redirect to review after posting
        //this.setState({ redirect: "/" });
        
    }).catch(error => {

        // Failed to create review
        alert('Review creation failed');

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
                  <Form.Control id="title" className="logInEntry" size="lg" type="text" placeholder="Title" />
                </div>
                <div className="logInEntryContainer">
                  <Form.Control id="text" className="logInEntry" size="lg" as="textarea" placeholder="Enter Review Description" />
                </div>
                <div className="logInEntryContainer">
                  <ImageUploader withIcon={false} withPreview={true} buttonText='Upload Image' onChange={this.onDrop} imgExtension={['.jpg', '.png']} maxFileSize={5242880} label={'Max File Size: 5MB File Types: jpg, png'}/>
                </div>
                <div>
                  <Link><Button variant="link">Forgot Password?</Button></Link>
                </div>
                <div className="logInEntryContainer">
                  <Button onClick={this.postReview} className="logInEntry" variant="primary">Submit</Button>
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