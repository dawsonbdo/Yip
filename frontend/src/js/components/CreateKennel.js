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
import InputTag from './InputTag';
import axios from 'axios';
import { createKennelJson } from './BackendHelpers.js';

class CreateKennel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      redirect: null,
      validated: false,
      showPopup: false,
      loading: false,
      tags: []
    };

    // Binds button handler
    this.createKennel = this.createKennel.bind(this);
  }

  updateTags(tags) {
    console.log("UPDATE TAGS: ");
    console.log(tags);
    this.setState({ tags: tags });
  }

  /**
   * Function handler for edit kennel submit button
   */
  createKennel(event) {

    // Prevents page from refreshing on submit
    event.preventDefault();
    event.stopPropagation();

    var createKennelForm = event.currentTarget;

    // Displays error if fields are empty
    if (createKennelForm.checkValidity() === false) {
      this.setState({ validated: true });
      return;
    }

    this.setState({ loading: true });

    var token = localStorage.getItem('jwtToken');

    // Parses form 
    var title = document.getElementById('title').value;
    var rules = document.getElementById('rules').value;

    // TODO: Parsing on the tags and muted words (comma separated)

    var rules = document.getElementById('rules').value;
    console.log(rules);

    // Uncomment if reverting to old tag form
    //var tagsStr = document.getElementById('tags').value;
    //var tags = tagsStr.split(", ");
    var tags = this.state.tags;

    var mutedStr = document.getElementById('mute').value;
    var mutedWords;

    var desc = document.getElementById('description').value;
    // Check muted words for whitespace
    if (mutedStr === null || mutedStr.match(/^ *$/) !== null) {
      mutedWords = null;

    } else {
      mutedWords = mutedStr.split(", ");
    }

    // Create form to send
    var form = createKennelJson(title, tags, mutedWords, rules, token, desc);

    // Send POST request with kennel name and tags
    axios({
      method: 'post',
      url: '/create_kennel',
      data: form
    }).then(response => {

      this.setState({ redirect: `/kennel-${title}` });

    }).catch(error => {

      this.setState({
        loading: false,
        showPopup: true
      });

    });

  }

  render() {

    let loading = <div></div>;
    if (this.state.loading) {
      loading = <Spinner className="logInEntryContainer" animation="border" size="sm"></Spinner>;
    }

    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    }
    else {
      return (
        <Container>
          <Row className="align-items-center">

            <Col className="text-center">
              <Link to="/"><img src={corgiImage} /></Link>

              <Toast className="mx-auto smallPopup" onClose={() => this.setState({ showPopup: false })} show={this.state.showPopup} autohide>
                <Toast.Header className="smallPopup">
                  <strong className="mx-auto">Kennel name already exists!</strong>
                </Toast.Header>
              </Toast>

              <div className="logInForm">
                <h1 className="logInLabel">Create Kennel</h1>
                <Form noValidate validated={this.state.validated} className="logInEntryContainer">
                  <div className="logInEntryContainer">
                    <Form.Label>Kennel Name</Form.Label>
                    <Form.Control id="title" className="logInEntry" type="text" required />
                    <Form.Control.Feedback type="invalid">Kennel name required.</Form.Control.Feedback>
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Description</Form.Label>
                    <Form.Control id="description" className="logInEntry" placeholder="Enter description" type="text" as="textarea" />
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Rules</Form.Label>
                    <Form.Control id="rules" className="logInEntry" placeholder="Enter rules line by line" type="text" as="textarea" />
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Tags</Form.Label>
                    <InputTag onTagChange={this.updateTags.bind(this)} />
                    {/* <Form.Control id="tags" className="logInEntry" placeholder="Enter as comma separated list" type="text" /> */}
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Muted Words</Form.Label>
                    <Form.Control id="mute" className="logInEntry" placeholder="Enter as comma separated list" type="text" />
                  </div>
                  <div className="logInEntryContainer">
                    <Button className="logInEntry" onClick={this.createKennel} variant="primary"><div>Submit{loading}</div></Button>
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

export default CreateKennel;