import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';

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

import axios from 'axios'

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
      followedKennelsArray: [],
      redirect: null
    };

    this.logout = this.logout.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
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

  handleSearch(event) {
    var query = document.getElementById('searchBar').value;
    this.setState({ redirect: {
      pathname: "/searchresults",
      state: {
        query: query,
        searchType: event
      }
    }});

  }

  componentDidMount() {
    var token = localStorage.getItem('jwtToken');
    var url = '/get_followed_kennels/' + token;
    axios({
      method: 'get',
      url: url
    }).then(response => {
      for (var i = 0; i < response.data.length; i++) {
        this.state.followedKennelsArray.push(response.data[i].kennel_name);
      }
      this.forceUpdate();
    }).catch(error => {
      //alert('Failed to get kennels');
    });

  }

  render() {
    let logBtn;
    if (isLoggedIn(this)) {
      logBtn = <Button onClick={this.logout} type="submit" variant="warning" className="mr-5">Logout</Button>;
    } else {
      logBtn = <div><Link to="/login"><Button id="login" type="submit" variant="warning" className="mr-5">Login</Button></Link>
        <Link to="/register"><Button type="submit" variant="warning" className="mr-5">Register</Button></Link></div>;
    }
    const followedKennels = this.state.followedKennelsArray.map(function (kennel) {
      return <Dropdown.Item href={`/kennel-${kennel}`}>{kennel}</Dropdown.Item>
    });

    if (!this.state.redirect) {
      return (
        <div id="spaceNav">
          <Navbar className="color-nav" expand="false" fixed="top">
            <Link to="/"><img className="yipIcon" src={corgiImage} /></Link>
            {isLoggedIn(this) && <DropdownButton id="dropdown-item-button" title="Followed Kennels" className="pr-5" variant="warning">
              {followedKennels}
            </DropdownButton>}
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
                <FormControl id="searchBar" type="text" placeholder="Search for Reviews or Kennels" />
                {/* <Button type="submit" variant="warning">Search</Button> */}
              </FormGroup>
            </Form>
            <DropdownButton
              alignRight
              onSelect={this.handleSearch}
              title="Search"
              id="dropdown-menu-align-right"
              variant="warning"
              type="submit"
            >
              <Dropdown.Item eventKey="Reviews">Reviews</Dropdown.Item>
              <Dropdown.Item eventKey="Kennels">Kennels</Dropdown.Item>
            </DropdownButton>
          </Navbar>
        </div>
      )
    }
    else {
      return <Redirect to={this.state.redirect} />
    }
  }
}

export default YipNavBar;