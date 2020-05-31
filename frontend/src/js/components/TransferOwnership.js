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
import axios from 'axios'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { setAllUsers } from './BackendHelpers.js';

class TransferOwnership extends Component {

    constructor(props) {
        super(props);

        this.state = {
            redirect: null,
            validated: false,
            reviewFrom: {},
            loading: false,
            showPopup: null,
            allUsers: []
        };

        // Binds button handler
        this.transferOwnership = this.transferOwnership.bind(this);
    }

    componentDidMount() {

        const reviewState = this.props.location.state;

        // Load the usernames from db
        setAllUsers(this);

        this.setState({ reviewFrom: reviewState });
    }

    /**
     * Function handler for login submit button
     */
    transferOwnership(event) {

        // Prevents page from refreshing on submit
        event.preventDefault();
        event.stopPropagation();

        var transferForm = event.currentTarget;

        // Displays error if fields are empty
        if (transferForm.checkValidity() === false) {
            this.setState({ validated: true });
            return;
        }

        this.setState({ loading: true });

        var kennel_name = this.state.reviewFrom.kennel_name;
        var token = localStorage.getItem('jwtToken');
        var username = document.getElementById('username').value;

        // Send POST request
        axios({
            method: 'post',
            url: '/transfer_ownership/' + username + '/' + token + '/' + kennel_name
        }).then(response => {

            this.setState({ loading: false, showPopup: 'Kennel ownership successfully transferred' });

            let redirectUrl = "/kennel-" + this.state.reviewFrom.kennel_name;
            this.setState({ redirect: redirectUrl });

        }).catch(error => {

            this.setState({ loading: false, showPopup: 'User does not exist!' });

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
                        <Col></Col>
                        <Col className="text-center">
                            <Link to="/"><img src={corgiImage} /></Link>

                            <Toast className="mx-auto smallPopup" onClose={() => this.setState({ showPopup: null })} show={this.state.showPopup} autohide>
                                <Toast.Header className="smallPopup">
                                    <strong className="mx-auto">{this.state.showPopup}</strong>
                                </Toast.Header>
                            </Toast>

                            <div className="logInForm">
                                <h1 className="logInLabel">Transfer Ownership</h1>
                                <Form noValidate validated={this.state.validated} onSubmit={this.transferOwnership} className="logInEntryContainer">
                                    <div className="logInEntryContainer">
                                        <Form.Label>Select a new Moderator</Form.Label>
                                        <Autocomplete
                                            id="username"
                                            options={this.state.allUsers}
                                            getOptionLabel={(option) => option.name}
                                            style={{ width: 300, marginLeft: 'auto', marginRight: 'auto' }}
                                            renderInput={(params) => <TextField {...params} label="Enter username here." variant="outlined" />}
                                        />

                                        <Form.Control.Feedback type="invalid">Username required.</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Button className="logInEntry" type="submit" variant="primary"><div>Submit{loading}</div></Button>
                                        <Button className="logInEntry" onClick={this.props.history.goBack} variant="primary">Cancel</Button>
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

}

export default TransferOwnership;