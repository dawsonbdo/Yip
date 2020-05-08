import React, { Component } from 'react';
import {Link} from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import corgiImage from '../../assets/corgi_shadow.png';

import axios from 'axios' 

import { createUserJson } from './BackendHelpers.js';

class CreateReview extends Component {

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
                    <ButtonToolbar>
                        <ButtonGroup className="mx-auto" aria-label="First group">
                            <Button>Wag</Button> 
                            <Button className="ml-2">Growl</Button> 
                        </ButtonGroup>
                    </ButtonToolbar>
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