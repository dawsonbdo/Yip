import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import corgiImage from '../../assets/corgi_shadow.png';
import { Redirect } from 'react-router-dom';

import axios from 'axios'

import { createKennelJson } from './BackendHelpers.js';

class CreateKennel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      redirect: null,
      validated: false,
    };

    // Binds button handler
    this.createKennel = this.createKennel.bind(this);
  }

  /**
   * Function handler for edit kennel submit button
   */
  createKennel(event) {

    // Prevents page from refreshing on submit
    event.preventDefault();
    event.stopPropagation();

    var token = localStorage.getItem('jwtToken');

    // Parses form 
    var title = document.getElementById('title').value;
    var rules = document.getElementById('rules').value; 

    // TODO: Parsing on the tags and muted words (comma separated)
    var tagsStr = document.getElementById('tags').value;
    var tags = tagsStr.split(", ");
    var mutedStr = document.getElementById('mute').value;
    var mutedWords = mutedStr.split(", ");
    var rules = document.getElementById('rules').value;

    // Create form to send
    var form = createKennelJson(title, tags, mutedWords, rules, token);

    // Send POST request with kennel name and tags
    axios({
      method: 'post',
      url: '/create_kennel',
      data: form
    }).then(response => {
      //alert("kennel created");
      this.setState({ redirect: `/kennel-${title}` });

    }).catch(error => {

      alert('failed kennel creation');

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
                <h1 className="logInLabel">Create Kennel</h1>
                <Form noValidate validated={this.state.validated} onSubmit={this.createKennel} className="logInEntryContainer">
                  <div className="logInEntryContainer">
                    <Form.Label>Title</Form.Label>
                    <Form.Control id="title" className="logInEntry" type="text" />
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Rules</Form.Label>
                    <Form.Control id="rules" className="logInEntry" type="text" as="textarea" />
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Tags</Form.Label>
                    <Form.Control id="tags" className="logInEntry" type="text" />
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Muted Words</Form.Label>
                    <Form.Control id="mute" className="logInEntry" type="text" />
                  </div>
                  <div className="logInEntryContainer">
                    <Button className="logInEntry" type="submit" variant="primary">Submit</Button>
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

export default CreateKennel;