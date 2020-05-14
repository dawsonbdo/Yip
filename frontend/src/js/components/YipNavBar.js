import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import FormGroup from 'react-bootstrap/FormGroup';
import corgiImage from '../../assets/corgi_shadow.png';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

// import Sidebar from './Sidebar';
// import Container from 'react-bootstrap/Container';
// import Col from 'react-bootstrap/Col';
// import Row from 'react-bootstrap/Row';

import { isLoggedIn, updateLoggedInState } from './BackendHelpers.js';

class YipNavBar extends Component {
  constructor(props) {
    super(props);

    // Creates state to keep track of if logged in
    this.state = {
      loggedIn: false,
    };

    this.logout = this.logout.bind(this);
  }

  logout(event) {
    localStorage.removeItem('jwtToken');
    updateLoggedInState(this);
  }

  // After component is loaded, update auth state
  componentWillMount() {

    // Sets logged in state of the component after loading page
    updateLoggedInState(this);
  }

  render() {
    let logBtn;
    if (isLoggedIn(this)) {
      logBtn = <Button onClick={this.logout} type="submit" variant="warning" className="mr-5">Logout</Button>;
    } else {
      logBtn = <div><Link to="/login"><Button id="login" type="submit" variant="warning" className="mr-5">Login</Button></Link>
        <Link to="/register"><Button type="submit" variant="warning" className="mr-5">Register</Button></Link></div>;
    }


    return (
      <div id="spaceNav">
        <Navbar className="color-nav" expand="false" fixed="top">
          <Link to="/"><img className="yipIcon" src={corgiImage} /></Link>
          <DropdownButton id="dropdown-item-button" title="Followed Kennels" className="pr-5" variant="warning">
            <Dropdown.Item as="button">Action</Dropdown.Item>
            <Dropdown.Item as="button">Another action</Dropdown.Item>
            <Dropdown.Item as="button">Something else</Dropdown.Item>
          </DropdownButton>
          {logBtn}
          {/* <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
            </Nav>
          </Navbar.Collapse> */}
          {/* <Button className="" variant="warning">Inbox</Button> */}
          <Form inline className="ml-auto float-right pt-3">
            <FormGroup>
              <FormControl id="searchBar" type="text" placeholder="Search for Reviews and Kennels" />
              {/* <Button type="submit" variant="warning">Search</Button> */}
            </FormGroup>
          </Form>
          <DropdownButton
            alignRight
            title="Search"
            id="dropdown-menu-align-right"
            variant="warning"
            type="submit"
          >
            <Dropdown.Item eventKey="1">Review</Dropdown.Item>
            <Dropdown.Item eventKey="2">Kennel</Dropdown.Item>
          </DropdownButton>
        </Navbar>
      </div>
    )
  }
}

export default YipNavBar;