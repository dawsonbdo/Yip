import React from 'react';
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import CreateReview from "./components/CreateReview"
import RecoverPassword from './components/RecoverPassword';
import Review from './components/Review';
import Kennel from './components/Kennel';
import EditKennel from './components/EditKennel';
import CreateKennel from './components/CreateKennel';
import SearchResults from './components/SearchResults';
import Profile from './components/Profile';
import Inbox from './components/Inbox';

const temp = ['Ralof: Hey, you. You\'re finally awake. You were trying to cross the border, \
							right? Walked right into that Imperial ambush, same as us, and that \
							thief over there. \
							<br /> <br />  \
							Lokir: Damn you Stormcloaks. Skyrim was fine until you came along. Empire was \
							nice and lazy. If they hadn\'t been looking for you, I could\'ve stolen  \
							that horse and been half way to Hammerfell. You there. You and me -- we \
							should be here. It\'s these Stormcloaks the Empire wants.  \
							<br /> <br /> \
							Ralof: We\'re all brothers and sisters in binds now, thief. \
							<br /> <br /> \
							Imperial Soldier: Shut up back there! \
							<br /> <br /> \
							[Lokir looks at the gagged man.] \
							<br /> <br /> \
							Lokir: And what\'s wrong with him? \
							<br /> <br /> \
							Ralof: Watch your tongue! You\'re speaking to Ulfric Stormcloak, the true High \
							King. \
							<br /> <br /> \
							Lokir: Ulfric? The Jarl of Windhelm? You\'re the leader of the rebellion. But if \
							they captured you... Oh gods, where are they taking us? \
							<br /> <br /> \
							Ralof: I don\'t know where we\'re going, but Sovngarde awaits. \
							<br /> <br /> \
							Lokir: No, this can\'t be happening. This isn\'t happening. \
							<br /> <br /> \
							Ralof: Hey, what village are you from, horse thief? \
							<br /> <br /> \
							Lokir: Why do you care? \
							<br /> <br /> \
							Ralof: A Nord\'s last thoughts should be of home. \
							<br /> <br /> \
							Lokir: Rorikstead. I\'m...I\'m from Rorikstead."', ['https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/ToddHoward2010sm_%28cropped%29.jpg/640px-ToddHoward2010sm_%28cropped%29.jpg']];

function App() {
  
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/login" exact component={Login} />
          <Route path="/register" exact component={Register} />
          <Route path="/createreview" exact component={CreateReview} />
          <Route path="/recoverpassword" exact component={RecoverPassword} />
          <Route path="/review" render={(props) => <Review reviewName={"Buy Skyrim"} reviewerName={"Todd Howard"} reviewText={temp[0]} reviewImg={temp[1]} {...props} />} />
		  <Route path="/editkennel" exact component={EditKennel} />
		  <Route path="/createkennel" exact component={CreateKennel} />
		  <Route path="/searchresults" exact component={SearchResults} />
		  <Route path="/profile" exact component={Profile} />
		  <Route path="/inbox" exact component={Inbox} />
		  <Route path="/kennel" render={(props) => <Kennel kennelName={"GARY'S KENNEL"}/>} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;

// Entry for rendering React components
const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : false;