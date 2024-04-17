/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useEffect, useState } from 'react';
import {Input, Select, Segment, Grid, Header, Divider} from 'semantic-ui-react';

const  RateLimitVerticalMenu = ({onLoadRateLimt}) => {

    const [graphQlParam, setGraphQlParam] = useState('first');
    const [pullRequests, setPullReq] = useState(20);
    const [commitsMessages, setCommitMsgs] = useState(20);
    const [dependencies, setDependencies] = useState(20);
    const [ratelimits, setRateLimts] = useState(0);
    const [error, setParamError] = useState('');

    const optionsRef = [
        {value: 'first', text: 'Select earliest'},
        {value: 'last', text: 'Select latest'}
    ];

    const gridStyle = {
        textAlign: 'center',
    }

    const handleForkItemOption = (e, data) => {
        setGraphQlParam( data.value );
        setParamError('');
    }

    // const parametersList = [graphQlParam, pullRequests, commitsMessages, dependencies, ratelimits];

    useEffect(() => {
        setRateLimts( (pullRequests*commitsMessages) + (dependencies * dependencies) );
        if(graphQlParam.length === 0){
            setParamError("Select Parameter..!");
        }else{
            onLoadRateLimt({graphQlParam, pullRequests, commitsMessages, dependencies, ratelimits })
        }
    }, [graphQlParam, pullRequests, commitsMessages, dependencies, ratelimits]);

    return (
        <div >
            <Segment style={gridStyle} >
            <Header as='h4' color='red' textAlign='center'> GraphQL Parameters</Header>
            <Divider />
                <Grid >
                    <Grid.Row stretched>
                        <Grid.Column >
                        <label>Select Parameter</label>
                            <Select placeholder='Select Forks' 
                                style = {{width: "80px"}}
                                options={optionsRef}
                                onChange={handleForkItemOption}
                                value={graphQlParam}                                
                                >
                            </Select>
                            <div style={{color: 'red', fontWeight: 'bold', textAlign:'center'}}>
                                {error}
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                    <Divider />
                    <Grid.Row>
                        <Grid.Column>
                            <label>Num of PullRequests (Max: 100)</label>
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
                    </Grid.Row>
                    <Divider />
                    <Grid.Row>
                        <Grid.Column>
                            <label>No of Commits (Max: 100)</label>
                            <div>
                                <Input 
                                    type="number"  
                                    required
                                    style = {{width: "80px"}}
                                    onChange={(e)  => {
                                        if (e.target.value*1 >= 0){
                                            setCommitMsgs( e.target.value*1 ); 
                                        }   
                                    }}
                                    value={commitsMessages}
                                />
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                    <Divider />
                    <Grid.Row>
                        <Grid.Column>
                            <label>No of dependencies (Max: 100)</label>
                            <div>
                                <Input 
                                    type="number"  
                                    required
                                    style = {{width: "80px"}}
                                    onChange={(e)  => {
                                        if (e.target.value*1 >= 0){
                                            setDependencies( e.target.value*1 ); 
                                        }   
                                    }}
                                    value={dependencies}
                                />
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                    <Divider />
                </Grid>
                <div style={{textAlign: 'center', fontSize: 'calc(8px + 1vmin)'}}>
                    Rate limit is: {ratelimits*1}. More about <a style={{fontSize: 'calc(8px + 1vmin)'}} href="https://docs.github.com/en/graphql/overview/resource-limitations" target="_blank" rel="noopener noreferrer">Resource limitations</a>
                </div>
            </Segment>
        </div>  
    )

}

export default RateLimitVerticalMenu;