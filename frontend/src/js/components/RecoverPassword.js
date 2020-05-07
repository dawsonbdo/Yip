import React, { Component } from 'react';
import {Link} from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import corgiImage from '../../assets/corgi_shadow.png';

class RecoverPassword extends Component {

  render() {
    return (
      <Container>
        <Row className="align-items-center">
          <Col></Col>
          <Col className="text-center">
            <Link to="/"><img src={corgiImage} /></Link>
            <div className="logInForm">
              <h1 className="logInLabel">Recover Password</h1>
              <Form className="logInEntryContainer">
                <div className="logInEntryContainer">
                  <Form.Control className="logInEntry" placeholder="Username" />
                </div>
                <div className="logInEntryContainer">
                  <Form.Control className="logInEntry" type="email" placeholder="Email" />
                </div>
                <div className="logInEntryContainer">
                 <Button onClick={this.onClick} className="logInEntry" variant="primary" type="submit">Submit</Button>
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

export default RecoverPassword;