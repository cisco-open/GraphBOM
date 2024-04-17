/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useState, createContext } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import NAvBar from './components/NavBar';
import './App';
import ErrorBoundary from './components/ErrorBoundary';
import RepoHistory from './components/Dashboard/RepoHistory';
import BlockChain from './components/Dashboard/BlockChain';
// import Login from './Login';
import DashboardContainerScanner from './components/Dashboard/DashboardContainerScanner';
import DashboardBinaryImageScanner from './components/Dashboard/DashboardBinaryImageScanner';

const store = createContext();

function App() {

  // const [token, setToken] = useState();

  // if(!token) {
  //   return <Login setToken={setToken} />
  // }

  // const [appData, setAppData] = useState(0);



  return (
    <div >
        <store.Provider>
          <BrowserRouter >
            <NAvBar />
            <Switch>
              {/* <Route exact path="/">
                <div className="App-header">
                  <p className='App'>Decentralized and Graph-based <br />Software Supply Chain Security (DG-SSCS)
                </p>
                </div>
              </Route> */}
              <Route exact path="/">
                <ErrorBoundary>
                    <Dashboard />
                </ErrorBoundary>
              </Route>
              <Route exact path="/dashboard" >
                <ErrorBoundary>
                    <Dashboard />
                </ErrorBoundary>
              </Route>
              <Route exact path="/repohistory" >
                <ErrorBoundary>
                    <RepoHistory />
                </ErrorBoundary>
              </Route>
              <Route exact path="/blockchain" >
                <ErrorBoundary>
                    <BlockChain />
                </ErrorBoundary>
              </Route>
              <Route exact path="/containerscan" >
                <ErrorBoundary>
                    <DashboardContainerScanner />
                </ErrorBoundary>
              </Route>
              <Route exact path="/binaryimagescan" >
                <ErrorBoundary>
                    <DashboardBinaryImageScanner />
                </ErrorBoundary>
              </Route>
            </Switch>
          </BrowserRouter>
        </store.Provider>
    </div>
  );
}

export default App;
