/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useEffect, useState } from 'react';
import '../../App.css';
import { Label, Icon} from 'semantic-ui-react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Graph } from "react-d3-graph";
import  {myConfig} from '../GraphConfig';

const DashboardAttackGraph = ({params}) => {

    const [graphData, setGraphData] = useState('');
    const [reponame, setGitRepoName] = useState('');
    const [graphMsg, setGraphMsg] = useState('');
    const [renderGraph, setRenderGraph] = useState(true);

    
    useEffect(() => {
        debugger;
        let graphData = params.attackGraph;
        if(graphData.nodes !== undefined){
            setGraphData(graphData);
            setRenderGraph(false);
            setGraphMsg();
        }
        else{
            setGraphMsg("No Graph Data ");
            setRenderGraph(true);
        }
        setGitRepoName(params.repo);
    },[params]);

    return(
        <div>
            <div>
            <header>
                  <h1>GraphBOM of {reponame}</h1>
              </header> 
            
            <div className='App'>
                { renderGraph ? graphMsg: '' }
            </div>

            {renderGraph ? '':
                (<div className='App disply-graph' > 
                              
                </div>)
            }
            </div>   
        </div>
    );
}
export default DashboardAttackGraph;