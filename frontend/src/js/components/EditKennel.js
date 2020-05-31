import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import corgiImage from '../../assets/corgi_shadow.png';
import { Redirect } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import Toast from 'react-bootstrap/Toast';
import axios from 'axios';
import InputTag from './InputTag';
import { editKennelJson } from './BackendHelpers.js';

class EditKennel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      redirect: null,
      validated: false,
      loading: false,
      showPopup: null,
      tags: this.props.location.state.tags,
      mutes: this.props.location.state.mutedWords,
      bans: this.props.location.state.bans,
    };

    // Binds button handler
    this.updateKennel = this.updateKennel.bind(this);
  }

  componentDidMount(){
    this.setState({tags: this.props.location.state.tags})
    this.setState({mutes: this.props.location.state.mutedWords})
    this.setState({bans: this.props.location.state.bans})
  }

  updateTags(tags) {
    this.setState({ tags: tags });
  }

   updateMutes(mutes) {
    this.setState({ mutes: mutes });
  }

  updateBans(bans) {
    this.setState({ bans: bans });
  }


  /**
   * Function handler for edit kennel submit button
   */
  updateKennel(event) {

    // Prevents page from refreshing on submit
    event.preventDefault();
    event.stopPropagation();

    this.setState({ loading: true });

    var token = localStorage.getItem('jwtToken');

    // Get kennel name passed in as prop
    var title = this.props.location.state.kennel_name;

    // Parses form 
    var rules = document.getElementById('rules').value;

    var tags = this.state.tags;
    var muted = this.state.mutes;
    var bans = this.state.bans;

    var desc = document.getElementById('description').value;

    // Create form to send
    var form = editKennelJson(title, tags, muted, rules, bans, token, desc);

    // Send POST request with kennel name and tags
    axios({
      method: 'post',
      url: '/edit_kennel',
      data: form
    }).then(response => {
      this.setState({ redirect: `/kennel-${this.props.location.state.kennel_name}` });

    }).catch(error => {

      this.setState({
        loading: false,
        showPopup: 'failed kennel update'
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
            <Toast className="mx-auto smallPopup" onClose={() => this.setState({ showPopup: null })} show={this.state.showPopup} autohide>
              <Toast.Header className="smallPopup">
                <strong className="mx-auto">{this.state.showPopup}</strong>
              </Toast.Header>
            </Toast>
            <Col className="text-center">
              <Link to="/"><img src={corgiImage} /></Link>
              <div className="logInForm">
                <h1 className="logInLabel">Edit Kennel</h1>
                <Form noValidate validated={this.state.validated} className="logInEntryContainer">
                  <div className="logInEntryContainer">
                    <Form.Label>Description</Form.Label>
                    <Form.Control id="description" className="logInEntry" defaultValue={this.props.location.state.description} type="text" as="textarea" />
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Rules</Form.Label>
                    <Form.Control id="rules" className="logInEntry" defaultValue={this.props.location.state.rules} type="text" as="textarea" />
                  </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Tags</Form.Label>
                    <InputTag tags={this.state.tags} onTagChange={this.updateTags.bind(this)} />
                   </div>
                  <div className="logInEntryContainer">
                    <Form.Label>Muted Words</Form.Label>
                    <InputTag tags={this.state.mutes} onTagChange={this.updateMutes.bind(this)} /></div>
                  <div className="logInEntryContainer">
                    <Form.Label>Banned Reviewers</Form.Label>
                    <InputTag tags={this.state.bans} onTagChange={this.updateBans.bind(this)} />
                  </div>
                  <div className="logInEntryContainer">
                    <Button className="logInEntry" onClick={this.updateKennel} variant="primary"><div>Save{loading}</div></Button>
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