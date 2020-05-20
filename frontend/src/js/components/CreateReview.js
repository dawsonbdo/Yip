import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
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
import YipNavBar from "./YipNavBar";

import axios from 'axios'

import { createUserJson, createReviewJson } from './BackendHelpers.js';

class CreateReview extends Component {

  constructor(props) {
    super(props);

    this.state = {
      pictures: [],
      kennelId: null,
      redirect: null,
      validated: false
    };
    this.onDrop = this.onDrop.bind(this);
    this.postReview = this.postReview.bind(this);
  }

  componentDidMount() {
    var kennelName = this.props.location.state.kennel_name;
    var token = localStorage.getItem('jwtToken');
    // Format URL to send in GET request
    var reqUrl = "/get_kennel/" + kennelName + "/" + token;
    // Send GET request with kennel name to get kennel information
    axios({
      method: 'get',
      url: reqUrl
    }).then(response => {
      // Gets kennel id
      console.log(response.data);
      this.setState({ kennelId: response.data.kennel_uuid });
    }).catch(error => {
      alert('Kennel does not exist in database');
    });
  }

  onDrop(picture) {
    this.setState({
      pictures: this.state.pictures.concat(picture)
    });
  }

  postReview() {

    event.preventDefault();
    event.stopPropagation();

    var reviewForm = event.currentTarget;

    // Displays error if fields are empty
    if (reviewForm.checkValidity() === false) {
      this.setState({ validated: true });
      return;
    }

    // TODO: Get UTC time or something standard instead of just local time

    // Read information in forms
    var title = document.getElementById('title').value;
    var text = document.getElementById('text').value;
    text = text.replace(/(?:\r\n|\r|\n)/g, '<br \/>');    // Replaces newlines with html new line
    var user = localStorage.getItem('jwtToken');

    var form = createReviewJson(this.state.kennelId, title, text, user);

    // Create form data for POST request and stringify json
    const fd = new FormData();
    fd.append('review', JSON.stringify(form));

    // Iterate through all pictures adding image/name to form
    for (var idx = 0; idx < this.state.pictures.length; idx++) {

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

      // Redirect to review after successfully posting
      this.setState({ redirect: `/review-${response.data}` });

    }).catch(error => {

      // Failed to create review
      alert('Review creation failed');

    });


  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    }
    else {
      return (
        <Container>
          <Row className="align-items-center">
            <Col className="text-center">
              <Link to="/"><img src={corgiImage} /></Link>
              <div className="logInForm">
                <h1 className="logInLabel">Create Review</h1>
                <Form noValidate validated={this.state.validated} className="logInEntryContainer" onSubmit={this.postReview}>
                <div className="logInEntryContainer">
                    <Form.Control id="kennel" className="logInEntry" size="lg" type="text" readOnly defaultValue={this.props.location.state.kennel_name} />
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Control id="title" className="logInEntry" size="lg" type="text" placeholder="Title" required/>
                    <Form.Control.Feedback type="invalid">Review title required.</Form.Control.Feedback>
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Control id="text" className="logInEntry" size="lg" as="textarea" placeholder="Enter Review Description" required/>
                    <Form.Control.Feedback type="invalid">Review description required.</Form.Control.Feedback>
                  </div>
                  <div className="logInEntryContainer">
                    <ImageUploader withIcon={false} withPreview={true} buttonText='Upload Image' onChange={this.onDrop} imgExtension={['.jpg', '.png']} maxFileSize={5242880} label={'Max File Size: 5MB File Types: jpg, png'} />
                  </div>
                  <div className="logInEntryContainer">
                    <Button className="logInEntry" variant="primary" type="submit">Post</Button>
                    <Button className="logInEntry" onClick={this.props.history.goBack} variant="primary">Cancel</Button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      )
    }
  }
}

export default CreateReview;