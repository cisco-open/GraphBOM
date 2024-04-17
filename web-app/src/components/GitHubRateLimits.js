/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useEffect, useState } from 'react';
import {Input, Select, Segment, Grid, Header, Divider} from 'semantic-ui-react';

const  GithubRateLimits = ({onLoadRateLimt}) => {

    const [forkItem, setForkItem] = useState('');
    const [forkVal, setforkVal] = useState(2);
    const [releases, setReleases] = useState(1);
    const [languages, setLanguages] = useState(1);
    const [pullRequests, setPullReq] = useState(1);
    const [commitsMessages, setCommitMsgs] = useState(1);
    const [dependencyManifest, setDepdmanifests] = useState(1);
    const [dependencies, setDependencies] = useState(1);
    const [ratelimits, setRateLimts] = useState(0);
    const [error, setError] = useState('');

    const optionsRef = [
        {value: 'first', text: 'first'},
        {value: 'last', text: 'last'}
    ];

    const gridStyle = {
        textAlign: 'center',
    }

    const handleForkItemOption = (e, data) => {
        setForkItem( data.value );
        setError('');
    }

    const parametersList = [forkItem, forkVal, releases, languages, pullRequests, commitsMessages, dependencyManifest, dependencies, ratelimits];

    useEffect(() => {
        if(forkItem.length === 0){
            setError("Select Parameter..!");
        }
        setRateLimts( forkVal + releases + languages + (pullRequests*commitsMessages) + (dependencyManifest*dependencies) );
        onLoadRateLimt({forkItem, forkVal, releases, languages, pullRequests, commitsMessages, dependencyManifest, dependencies, ratelimits })
    }, parametersList);

    return (
        <div >
            <Segment style={gridStyle} >
            <Header as='h4' color='red' textAlign='center'> GraphQL Parameters</Header>
            <Divider />
                <Grid divided columns='equal'>
                    <Grid.Row>
                        <Grid.Column width={3}>
                        <label>Select Parameter</label>
                            <Select placeholder='Select Forks' 
                                style = {{width: "80px"}}
                                options={optionsRef}
                                onChange={handleForkItemOption}
                                value={forkItem}                                
                                >
                            </Select>
                            <div style={{color: 'red', fontWeight: 'bold', textAlign:'center'}}>
                                {error}
                            </div>
                        </Grid.Column>
                        <Grid.Column width={13}>    
                            <Grid columns='equal' divided>
                                <Grid.Row>
                                    <Grid.Column>
                                        <label># Forks</label>
                                        <div>
                                        <Input 
                                            type="number"  
                                            required
                                            style = {{width: "80px"}}
                                            onChange={(e)  => {
                                                if (e.target.value*1 >= 20){
                                                    setforkVal( e.target.value*1); 
                                                }   
                                            } }
                                            value={forkVal}
                                        />
                                        </div>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <label># Releases</label>
                                        <div>
                                            <Input 
                                                type="number"  
                                                required
                                                style = {{width: "80px"}}
                                                onChange={(e)  => {
                                                    if (e.target.value*1 > 0){
                                                        setReleases( e.target.value*1 ); 
                                                    }   
                                                } }
                                                value={releases}
                                            />
                                        </div>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <label># languages</label>
                                        <div>
                                            <Input 
                                                type="number"  
                                                required
                                                style = {{width: "80px"}}
                                                onChange={(e)  => {
                                                    if (e.target.value*1 > 0){
                                                        setLanguages( e.target.value*1 ); 
                                                    }   
                                                } }
                                                value={languages}
                                            />
                                        </div>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <label># PullRequests</label>
                                        <div>
                                            <Input 
                                                type="number"  
                                                required
                                                pattern="^[0-9]*$"
                                                style = {{width: "80px"}}
                                                onChange={(e)  => {
                                                    if (e.target.value*1 >= 0){
                                                        setPullReq( e.target.value*1 ); 
                                                    }   
                                                } }
                                                value={pullRequests}
                                            />
                                        </div>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <label># Commits</label>
                                        <div>
                                            <Input 
                                                type="number"  
                                                required
                                                style = {{width: "80px"}}
                                                onChange={(e)  => {
                                                    if (e.target.value*1 >= 1){
                                                        setCommitMsgs( e.target.value*1 ); 
                                                    }   
                                                } }
                                                value={commitsMessages}
                                            />
                                        </div>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <label># dependencyGraph</label>
                                        <div>
                                            <Input 
                                                type="number"  
                                                required
                                                style = {{width: "80px"}}
                                                onChange={(e)  => {
                                                    if (e.target.value*1 >= 1){
                                                        setDepdmanifests( e.target.value*1 ); 
                                                    }   
                                                } }
                                                value={dependencyManifest}
                                            />
                                        </div>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <label># dependencies</label>
                                        <div>
                                            <Input 
                                                type="number"  
                                                required
                                                style = {{width: "80px"}}
                                                onChange={(e)  => {
                                                    if (e.target.value*1 >= 1){
                                                        setDependencies( e.target.value*1 ); 
                                                    }   
                                                } }
                                                value={dependencies}
                                            />
                                        </div>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
            
            

            <div style={{textAlign: 'center', fontSize: 'calc(8px + 1vmin)'}}>
             Rate limit is: {ratelimits}. More about <a style={{fontSize: 'calc(8px + 1vmin)'}} href="https://docs.github.com/en/graphql/overview/resource-limitations" target="_blank" rel="noopener noreferrer">Resource limitations</a>
            </div>
        </div>  
    )

}

export default GithubRateLimits;