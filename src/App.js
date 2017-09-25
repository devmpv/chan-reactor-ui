import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom'
import './static/css/bootstrap.min.css';
import './static/css/main.css';
import MainPage from "./components/MainPage";
import BoardPage from "./components/BoardPage";
import ThreadPage from "./components/ThreadPage";

class App extends Component {
    render() {
        return (
            <Router>
                <div>
                    <Route exact path="/" component={MainPage}/>
                    <Route exact path="/:boardName" component={BoardPage}/>
                    <Route exact path="/:boardName/thread/:threadId" component={ThreadPage}/>
                </div>
            </Router>
        );
    }
}

export default App;
