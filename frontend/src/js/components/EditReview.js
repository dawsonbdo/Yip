import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import ImageLoader from './ImageLoader';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import corgiImage from '../../assets/corgi_shadow.png';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';
import { createReviewJson } from './BackendHelpers.js';

class EditReview extends Component {

    constructor(props) {
        super(props);

        this.state = {
            pictures: this.props.location.state.images,
            files: [],
            kennelId: null,
            tags: [],
            checkedTags: [],
            redirect: null,
            validated: false,
            loading: false,
            text: this.props.location.state.text.replace(/<br\s*[\/]?>/gi, "\n") // Replaces <br /> with \n for displaying
        };
        this.onDrop = this.onDrop.bind(this);
        this.updateReview = this.updateReview.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
    }

    componentDidMount() {
        var kennelName = this.props.location.state.kennel_name;
        // this.setState({ pictures: this.props.location.state.images }); TODO images
        var token = localStorage.getItem('jwtToken');
        // Format URL to send in GET request
        var reqUrl = "/get_kennel/" + kennelName + "/" + token;
        // Send GET request with kennel name to get kennel information
        axios({
            method: 'get',
            url: reqUrl
        }).then(response => {
            // Gets kennel id
            console.log(response.data);
            this.setState({ kennelId: response.data.kennel_uuid, tags: response.data.tags });

            for (var i = 0; i < response.data.tags.length; i++) {
                this.state.checkedTags[i] = false;
            }

            // Iterate over current existing tags
            for (var i = 0; i < this.props.location.state.tags.length; i++) {
                // Check that tags still exist (in case moderator edited tags)
                if (response.data.tags.indexOf(this.props.location.state.tags[i]) !== -1) {
                    // Index of current tag in kennel tags array
                    var idxOfTag = response.data.tags.indexOf(this.props.location.state.tags[i]);

                    // Makes tag that was already selected checked by default
                    this.state.checkedTags[idxOfTag] = true;

                }
            }

            this.setState({ checkedTags: this.state.checkedTags });

        }).catch(error => {
            alert('Kennel does not exist in database');
        });
    }

    onDrop(picture) {
        this.setState({
            pictures: picture
        });
    }

    handleCheck(index, event) {
        this.state.checkedTags[index] = !this.state.checkedTags[index];
        this.setState({ checkedTags: this.state.checkedTags });
    }

    updateReview() {

        event.preventDefault();
        event.stopPropagation();

        var reviewForm = event.currentTarget;

        // Displays error if fields are empty
        if (reviewForm.checkValidity() === false) {
            this.setState({ validated: true });
            return;
        }

        this.setState({loading: true});

        // TODO: Get UTC time or something standard instead of just local time

        // Read information in forms
        var title = document.getElementById('title').value;
        var text = document.getElementById('text').value;
        text = text.replace(/(?:\r\n|\r|\n)/g, '<br \/>');    // Replaces newlines with html new line
        var user = localStorage.getItem('jwtToken');

        var form = createReviewJson(this.state.kennelId, title, text, user);

        // Create form data for POST request and stringify json
        const fd = new FormData();
        fd.append('review', JSON.stringify(form));


        //alert(this.state.pictures.length);
        // Iterate through all pictures adding image/name to form
        for (var idx = 0; idx < this.state.pictures.length; idx++) { 
            //alert(this.state.pictures[idx].size);
          // Append current image/name
          if(this.state.pictures[idx].size == 1){
             fd.append('image', new File(["a"], "Empty", {type: 'image/jpg'}));
             fd.append('name', this.state.pictures[idx].name.substring(47));
          } else {
            fd.append('image', this.state.pictures[idx]);
            fd.append('name', this.state.pictures[idx].name);
          }
        }

        for (var i = 0; i < this.state.checkedTags.length; i++) {
            if (this.state.checkedTags[i]) {
                fd.append('tag', this.state.tags[i]);
            }
        }

        // Send POST request with review multipart
        axios({
            method: 'post',
            url: '/edit_review/' + this.props.location.state.review_id + "/" + user,
            data: fd
        }).then(response => {

            // Redirect to review after successfully posting
            this.setState({ redirect: `/review-${response.data}` });

        }).catch(error => {

            // Failed to create review
            alert('Review edit failed');
            this.setState({loading: false});

        });


    }

    render() {

        let loading = <div></div>;
        if (this.state.loading) {
            loading = <Spinner className="logInEntryContainer" animation="border" size="sm"></Spinner>;
        }

        let selectTagsTitle;
        if (this.state.tags.length > 0) {
            selectTagsTitle = <h4 style={{paddingTop: '20'}}>Select Tags</h4>;
        }

        let tagCheckboxes = this.state.tags.map((tag, index) => (
            <div key={`default-checkbox`} className="mb-3">
                <Form.Check
                    type="checkbox"
                    id={tag}
                    label={`${tag}`}
                    //onChange={this.handleCheck.bind(this, index)}
                    //defaultChecked={this.state.checkedTags[index]}
                    onChange={this.handleCheck.bind(this, index)}
                    checked={this.state.checkedTags[index]}
                />
            </div>
        ))

        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

        else {
            return (
                <Container>
                    <Row className="align-items-center">
                        <Col className="text-center">
                            <Link to="/"><img src={corgiImage} /></Link>
                            <div className="logInForm">
                                <h1 className="logInLabel">Edit Review</h1>
                                <Form noValidate validated={this.state.validated} className="logInEntryContainer" onSubmit={this.updateReview}>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="kennel" className="logInEntry" size="lg" type="text" readOnly defaultValue={this.props.location.state.kennel_name} />
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="title" className="logInEntry" size="lg" type="text" placeholder="Title" defaultValue={this.props.location.state.title} required />
                                        <Form.Control.Feedback type="invalid">Review title required.</Form.Control.Feedback>
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Form.Control id="text" className="logInEntry" size="lg" as="textarea" placeholder="Enter Review Description" defaultValue={this.state.text} required />
                                        <Form.Control.Feedback type="invalid">Review description required.</Form.Control.Feedback>
                                    </div>
                                    <div><Form>
                                        {selectTagsTitle}
                                        {tagCheckboxes}
                                    </Form></div>
                                    <div className="logInEntryContainer">
                                        <ImageLoader defaultImages={this.state.pictures} singleImage={false} withIcon={false} withPreview={true} buttonText='Upload Image' onChange={this.onDrop} imgExtension={['.jpg', '.png']} maxFileSize={5242880} label={'Max File Size: 5MB File Types: jpg, png'} />
                                    </div>
                                    <div className="logInEntryContainer">
                                        <Button className="logInEntry" variant="primary" type="submit"><div>Update{loading}</div></Button>
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

export default EditReview;