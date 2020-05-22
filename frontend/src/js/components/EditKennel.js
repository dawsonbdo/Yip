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

import { createKennelJson, editKennelJson } from './BackendHelpers.js';

class EditKennel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      redirect: null,
      validated: false
    };

    // Binds button handler
    this.updateKennel = this.updateKennel.bind(this);
  }

  /**
   * Function handler for edit kennel submit button
   */
  updateKennel(event) {

    // Prevents page from refreshing on submit
    event.preventDefault();
    event.stopPropagation();

    var token = localStorage.getItem('jwtToken');

    // Get kennel name passed in as prop
    var title = this.props.location.state.kennel_name;

    // Parses form 
    var rules = document.getElementById('rules').value.split("\n"); 

    // TODO: Parsing on the tags and muted words (comma separated)
    var tagsStr = document.getElementById('tags').value;
    var tags = tagsStr.split(", ");

    var mutedStr = document.getElementById('mute').value; 
    var mutedWords;
    // Check muted words for whitespace
    if (mutedStr === null || mutedStr.match(/^ *$/) !== null){
      mutedWords = null;
     
    } else {
      mutedWords = mutedStr.split(", ");
    }

    var banStr = document.getElementById('bans').value; 
    var bans = banStr.split(", ");


    // Create form to send
    var form = editKennelJson(title, tags, mutedWords, rules, bans, token, "description");

    console.log(form);

    // Send POST request with kennel name and tags
    axios({
      method: 'post',
      url: '/edit_kennel',
      data: form
    }).then(response => {
      // alert("kennel updated");
      this.setState({ redirect: `/kennel-${this.props.location.state.kennel_name}` });

    }).catch(error => {

      alert('failed kennel update');

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
                <h1 className="logInLabel">Edit Kennel</h1>
                <Form noValidate validated={this.state.validated} onSubmit={this.updateKennel} className="logInEntryContainer">
                  <div className="logInEntryContainer">
                    <Form.Label>Rules</Form.Label>
                    <Form.Control id="rules" className="logInEntry" defaultValue={this.props.location.state.rules} type="text" as="textarea"/>
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Tags</Form.Label>
                    <Form.Control id="tags" className="logInEntry" defaultValue={this.props.location.state.tags} type="text"/>
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Muted Words</Form.Label>
                    <Form.Control id="mute" className="logInEntry" defaultValue={this.props.location.state.mutedWords} type="text"/>
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Banned Reviewers</Form.Label>
                    <Form.Control id="bans" className="logInEntry" type="text"/>
                  </div>
                  <div className="logInEntryContainer">
                    <Button className="logInEntry" type="submit" variant="primary">Save</Button>
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

export default EditKennel;