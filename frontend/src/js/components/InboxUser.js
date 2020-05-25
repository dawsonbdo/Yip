import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

class InboxUser extends Component {
    constructor(props) {
        super(props);

        // Binds button handler
        this.changeUser = this.changeUser.bind(this);
    }

    changeUser(){
        console.log("CLICKED: " + this.props.userName);
        //this.props.loadUserMessages("", this.props.userName);
        this.props.onUserChange(this.props.userName);
    }

    render() {
        return (
            <Container className="pb-3">
                        <div className="logInForm moveLeft inboxUserLabel">
                                <button id="btn" onClick={this.changeUser}  className="text-center pt-2 pl-2 button">{this.props.userName}</button>
                        </div>
            </Container>
        )
    }
}

export default InboxUser;

InboxUser.propTypes = {
    userName: PropTypes.string.isRequired,
}