import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import { Navbar } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import { Button } from 'react-bootstrap';
import FormGroup from 'react-bootstrap/FormGroup';

class YipNavBar extends Component {
    render() {
        return (
            <div id="spaceNav">
              <Navbar className="color-nav" expand="false" fixed="top">
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="mr-auto">
                    <Nav.Link href="#home">Home</Nav.Link>
                    <Nav.Link href="#link">Link</Nav.Link>
                  </Nav>
                </Navbar.Collapse>
                <Form inline className="ml-auto">
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
                <Link to="/login"><Button type="submit" variant="warning" className="mr-5">Login</Button></Link>
                <Link to="/register"><Button type="submit" variant="warning" className="mr-5">Register</Button></Link>
                <Navbar.Brand href="#home" id="yipBrand">Yip</Navbar.Brand>
              </Navbar>
            </div>
        )
    }
}

export default YipNavBar;