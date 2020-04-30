import React, { Component } from 'react';
import ReactDOM from "react-dom";
import { Button } from 'react-bootstrap';
import '../css/App.css';

class App extends Component{
	render() {
		return(
			<Button>Insert nice application here</Button>
		);
	}
}

export default App;

// Entry for rendering React components
const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : false;