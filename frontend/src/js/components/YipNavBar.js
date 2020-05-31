import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import FormGroup from 'react-bootstrap/FormGroup';
import corgiImage from '../../assets/corgi_shadow.png';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Toast from 'react-bootstrap/Toast';
import axios from 'axios'
import { isLoggedIn, updateLoggedInState, updateLoggedInUser } from './BackendHelpers.js';

class YipNavBar extends Component {
  constructor(props) {
    super(props);

    // Creates state to keep track of if logged in
    this.state = {
      loggedIn: false,
      user: "",
      followedKennelsArray: [],
      createdKennelsArray: [],
      redirect: null,
      followedKennelsLoaded: false,
      createdKennelsLoaded: false,
      loadedUser: false,
      showPopup: null
    };

    this.logout = this.logout.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.stringEscape = this.stringEscape.bind(this);
  }

  logout(event) {
    localStorage.removeItem('jwtToken');
    updateLoggedInState(this);

    if (this.props.fromHomePage) {
      this.props.resetAuthHomePage();
    }
  }

  // After component is loaded, update auth state
  componentWillMount() {

    // Sets logged in state of the component after loading page
    updateLoggedInState(this);

    // Sets user that is logged in
    updateLoggedInUser(this);
  }

  /**
   * Handler function for search bar
   */
  handleSearch(event) {
    // Get user input from search bar
    var query = document.getElementById('searchBar').value;

    // Ignores invalid characters
    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
    if (pattern.test(query)) {
      this.setState({ showPopup: 'ONE OR MORE INVALID CHARACTERS' });
      return;
    }

    // Ignores whitespace
    if (query.trim().length === 0) {
      this.setState({ showPopup: 'INPUT IS BLANK' });
      return;
    }

    query = encodeURIComponent(query);


    // Redirect to search results page with search type and query in url
    this.setState({ redirect: `/searchresults-${event}-${query}` });

  }

  // Replace escape chars
  stringEscape(s) {
    return s ? s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\v/g, '\\v').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/[\x00-\x1F\x80-\x9F]/g, hex) : s;
    function hex(c) { var v = '0' + c.charCodeAt(0).toString(16); return '\\x' + v.substr(v.length - 2); }
  }

  handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    // Get user input from search bar
    var query = document.getElementById('searchBar').value;

    // Ignores invalid characters
    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
    if (pattern.test(query)) {
      this.setState({ showPopup: 'ONE OR MORE INVALID CHARACTERS' });
      return;
    }

    // Ignores whitespace
    if (query.trim().length === 0) {
      this.setState({ showPopup: 'INPUT IS BLANK' });
      return;
    }

    query = encodeURIComponent(query);

    // alert("URL QUERY: " + query);

    // Redirect to search results page with search type and query in url
    this.setState({ redirect: `/searchresults-Reviews-${query}` });

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
      this.setState({ followedKennelsLoaded: true });

    }).catch(error => {
      this.setState({ showPopup: 'Failed to get kennels' })
    });
  }

  componentDidUpdate() {
    if (this.state.user != "" && !this.state.loadedUser) {
      this.setState({ loadedUser: true });
      axios({

        method: 'get',
        url: '/get_created_kennels/' + this.state.user,
      }).then(response => {

        // Store created kennels in createdKennelArray
        for (var i = 0; i < response.data.length; i++) {

          // Add kennel info to array for rendering kennel cards
          this.state.createdKennelsArray.push(response.data[i].kennel_name);
        }

        this.setState({ createdKennelsLoaded: true });

      }).catch(error => {

        // Review not found in database
        this.setState({ showPopup: 'User has no created kennels' });

      });
    }

  }

  render() {
    const followedKennels = this.state.followedKennelsArray.map(function (kennel) {
      return <Dropdown.Item href={`/kennel-${kennel}`}>{kennel}</Dropdown.Item>
    });
    const createdKennels = this.state.createdKennelsArray.map(function (kennel) {
      return <Dropdown.Item href={`/kennel-${kennel}`}>{kennel}</Dropdown.Item>
    });
    let logBtn;
    if (isLoggedIn(this)) {
      logBtn = <div>
        <DropdownButton id="dropdown-item-button" title={this.state.user} className="mr-2 float-left" variant="light">
          <Dropdown.Item href={`/user-${this.state.user}`}>View Profile</Dropdown.Item>
          <Dropdown.Item href="/createkennel">Create Kennel</Dropdown.Item>
        </DropdownButton>
        <DropdownButton id="dropdown-item-button" title="Kennels" className="mr-2 float-left" variant="light">
          <Dropdown.Header>Followed</Dropdown.Header>
          {followedKennels}
          <Dropdown.Divider />
          <Dropdown.Header>Created</Dropdown.Header>
          {createdKennels}
        </DropdownButton>
        <Link to={{
          pathname: "/",
        }}><Button onClick={this.logout} type="submit" variant="light" className="mr-2 float-left">Logout</Button></Link></div>;
    } else {
      logBtn = <div><Link to="/login"><Button id="login" type="submit" variant="light" className="mr-2">Login</Button></Link>
        <Link to="/register"><Button type="submit" variant="light" className="mr-2">Register</Button></Link></div>;
    }

    if (!this.state.redirect) {
      return (
        <div id="spaceNav">
          <Navbar className="color-nav" expand="false" fixed="top">
            <Link to="/"><img className="yipIcon" src={corgiImage} /></Link>
            {logBtn}
            <Toast className="mx-auto smallPopup" onClose={() => this.setState({ showPopup: null })} show={this.state.showPopup} autohide>
              <Toast.Header className="smallPopup">
                <strong className="mx-auto">{this.state.showPopup}</strong>
              </Toast.Header>
            </Toast>

            <Form inline className="ml-auto float-right pt-3" onSubmit={this.handleSubmit}>
              <FormGroup>
                <FormControl id="searchBar" type="text" placeholder="Search for Reviews or Kennels" />
              </FormGroup>
              <DropdownButton
                alignRight
                className="pr-4"
                onSelect={this.handleSearch}
                title="Search"
                id="dropdown-menu-align-right"
                variant="light">
                <Dropdown.Item eventKey="Reviews">Reviews</Dropdown.Item>
                <Dropdown.Item eventKey="Kennels">Kennels</Dropdown.Item>
              </DropdownButton>
            </Form>
          </Navbar>
        </div>
      )
    }
    else {
      return <Redirect to={this.state.redirect} push />
    }
  }
}

export default YipNavBar;