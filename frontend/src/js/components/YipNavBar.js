import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavItem from 'react-bootstrap/NavItem';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import FormGroup from 'react-bootstrap/FormGroup';
import corgiImage from '../../assets/corgi_shadow.png';
import Sidebar from 'react-boostrap-sidebar';
//import Glyphicon from 'react-boostrap/Glyphicon';

import { isLoggedIn, updateLoggedInState } from './BackendHelpers.js';

class YipNavBar extends Component {
    constructor(props){
      super(props);

      // Creates state to keep track of if logged in
      this.state = { 
        loggedIn: false,
        isVisible: false 
      };

      this.onSeetSidebarOpen = this.onSetSidebarOpen.bind(this);
    }
    
    updateModal(isVisible) {
    	this.state.isVisible = isVisible;
      this.forceUpdate();
    }

    // After component is loaded, update auth state
    componentDidMount(){

      // Sets logged in state of the component after loading page
      updateLoggedInState(this);
    }

    // Controls login/logout button
    componentDidUpdate(){

      // If logged in, should be logout button
      if ( isLoggedIn(this) ){

        // TODO: Show logout button
        document.getElementById('login').innerHTML = "Logout";

      } else { // Otherwise should be login button

        // TODO: Show login button
        document.getElementById('login').innerHTML = "Login";

      }

    }

    render() {
        return (
            <div id="spaceNav">
              <div>
                  <Button bsStyle="primary" onClick={ () => this.updateModal(true) }></Button>
                  <Sidebar side='left' isVisible={ this.state.isVisible } onHide={ () => this.updateModal(false) }>
                    <Nav>
                      <NavItem href="#">Link 1</NavItem>
                      <NavItem href="#">Link 2</NavItem>
                      <NavItem href="#">Link 3</NavItem>
                      <NavItem href="#">Link 4</NavItem>
                    </Nav>
                  </Sidebar>
              </div>
              <Navbar className="color-nav" expand="false" fixed="top">
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="mr-auto">
                    <Nav.Link href="#home">Home</Nav.Link>
                    <Nav.Link href="#link">Link</Nav.Link>
                  </Nav>
                </Navbar.Collapse>
                <Form inline className="ml-auto pt-3">
                <FormGroup>
                  <FormControl id="searchBar" type="text" placeholder="Search for Reviews and Kennels" />
                  <Button type="submit" variant="primary" >Search</Button>
                </FormGroup>
                </Form>
                <NavDropdown title="" id="basic-nav-dropdown" className="mr-auto">
                  <NavDropdown.Item href="#action/3.1">Review</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.2">Kennel</NavDropdown.Item>
                </NavDropdown>
                <Link to="/login"><Button id = "login" type="submit" variant="warning" className="mr-5">Login</Button></Link>
                <Link to="/register"><Button type="submit" variant="warning" className="mr-5">Register</Button></Link>
                {/* <Navbar.Brand href="#home" id="yipBrand">Yip</Navbar.Brand> */}
                <Link to="/"><img className="yipIcon" src={corgiImage} /></Link>
              </Navbar>
            </div>
        )
    }
}

export default YipNavBar;