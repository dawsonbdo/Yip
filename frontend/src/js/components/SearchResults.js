import React, { Component } from 'react';

import Jumbotron from "react-bootstrap/Jumbotron";
import Button from 'react-bootstrap/Button';
import ReviewCard from './ReviewCard';
import YipNavBar from "./YipNavBar";
import KennelCard from './KennelCard';
import Container from 'react-bootstrap/Container';
import LoadingIcon from '../../assets/loadingIcon.gif';
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { isLoggedIn, updateLoggedInState } from './BackendHelpers.js';

import axios from 'axios'

class SearchResults extends Component {
    constructor(props) {
        super(props);

        // Creates state to keep track of if logged in
        this.state = {
            loggedIn: false,
            searchDisplay: false,
            resultArray: [],
        };
    }

    componentDidUpdate(prevProps) {

        if (prevProps.location.state.query != this.props.location.state.query || 
            prevProps.location.state.searchType != this.props.location.state.searchType) {
            window.location.reload();
        }
    }

    componentDidMount() {

        if (this.props.location.state.searchType == "Kennels") {
            this.searchKennels(this.props.location.state.query);
        }
        else {
            this.searchReviews(this.props.location.state.query);
        }

    }

    // Searches all kennels using query passed in
    searchKennels(query) {
        axios({
            method: 'get',
            url: '/search_kennels/' + query,
        }).then(response => {

            console.log("KENNEL SEARCH QUERY: " + query);

            // Iterate through kennels
            for (var i = 0; i < response.data.length; i++) {

                // Print kennels to console for now
                console.log(response.data[i]);
                this.state.resultArray.push({
                    kennelName: response.data[i].kennel_name,
                    kennelRules: response.data[i].rules,
                });

            }
            this.setState({ searchDisplay: true });


        }).catch(error => {

            // Review not found in database
            alert('Failed to search kennels');

        });
    }

    // Searches all reviews using query passed in
    searchReviews(query) {
        axios({
            method: 'get',
            url: '/search_reviews/' + query,
        }).then(response => {

            console.log("REVIEW SEARCH QUERY: " + query);

            // TODO: Populate ReviewCards using response.data (this is an array of DisplayReview objs)
            //       (check backend/src/reviews/handlers.rs for the fields of a DisplayReview)

            // Iterate through reviews
            for (var i = 0; i < response.data.length; i++) {

                // Print reviews to console for now
                console.log(response.data[i]);
                this.state.resultArray.push({
                    title: response.data[i].title,
                    author: response.data[i].author,
                    text: response.data[i].text,
                    id: response.data[i].review_uuid
                });

            }

            this.setState({ searchDisplay: true });

        }).catch(error => {

            // Review not found in database
            alert('Failed to search reviews');

        });
    }

    render() {

        // DYNAMICALLY GET REVIEWS HERE AND PUT IT IN THE IF STATEMENT BELOW
        let results;
        if (this.props.location.state.searchType == "Reviews") {
            results = this.state.resultArray.map(function (result) {
                return <ReviewCard reviewId={result.id} reviewName={result.title} reviewerName={result.author} reviewPreview={{ __html: result.text }} />
            });
        }
        else {
            results = this.state.resultArray.map(function (result) {
                return <KennelCard kennelName={result.kennelName} kennelRules={result.kennelRules} />
            });
        }

        let search;
        if (this.state.searchDisplay) {
            search =
                <div>
                    <Jumbotron id="jumbotron" className="text-center">
                        <h1>Results for '{this.props.location.state.query}' in {this.props.location.state.searchType}: </h1>
                    </Jumbotron>
                    <Container>
                        <Row>
                            <Col>
                                {results}
                            </Col>
                        </Row>
                    </Container>
                </div>
        } else {
            search =
                <Row>
                    <Image className="mx-auto loadingIcon loading" src={LoadingIcon}></Image>
                </Row>;
        }

        return (
            <div>
                <YipNavBar />
                {search}
            </div>
        )
    }
}

export default SearchResults;