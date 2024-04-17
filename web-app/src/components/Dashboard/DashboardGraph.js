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


const DashboardGraph = ({params}) => {

    const [graphData, setGraphData] = useState('');
    const [reponame, setGitRepoName] = useState('');
    const [graphMsg, setGraphMsg] = useState('');
    const [renderGraph, setRenderGraph] = useState(true);

    

    const onMouseOverNode = (nodeId, node) => {
          let sourceVuln = (node.source_url !== '' ? <div><Icon name='linkify' /><a href={node.source_url} target="_blank" rel="noopener noreferrer">Source</a></div>:'No Source Url for Vulnerability');

          let author_profile = <div><Icon name='linkify' /> <a href={node.author} target="_blank" rel="noopener noreferrer">Author Profile</a></div>

          let release_pkg = (node.id === reponame && node.releases[0].releases.length > 0 ? <div><Icon name='linkify' /><a href={"https://github.com/"+reponame+"/releases/tag/"+node.releases[0].releases[0]} target="_blank" rel="noopener noreferrer">Latest Release Url</a></div>:'Release URl not found')

          const msg = () => (
            ( node.id === reponame ?
              (<div style={{textAlign:'left'}}>
                <Label basic>Name: {node.id} </Label><br />
                <Label basic>{author_profile}</Label> <br />
                <Label basic>Latest Release: {node.releases[0].releases.length > 0  ? node.releases[0].releases[0] : "No Releases yet!" }</Label> <br />
                <Label basic>{release_pkg}</Label>
                <Label basic>Hash: {node.hashVal}</Label>
                <Label basic>license: {node.license_info[0].license[0]}</Label>
                <Label basic>CVE ID: {node.cve_id}</Label>
              </div>) 
              :
              (<div style={{textAlign:'left'}}>
                  <Label basic>Vertex: {node.id}</Label>
                  <Label basic>{author_profile}</Label>
                  <Label basic>Hash: {node.hashVal}</Label>
                  <Label basic>CVE ID: {node.cve_id}</Label>
                  <Label basic>{sourceVuln}</Label>
              </div>)
            )
          );        
          toast.success(msg, {
            position: toast.POSITION.TOP_RIGHT
          }
        );

    }

    useEffect(() => {

        let graphData = params.graphRow;
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
                  <h1>Software Supply Chain Security Graph of {reponame}</h1>
              </header> 
            
            <div className='App'>
                { renderGraph ? graphMsg: '' }
            </div>

            {renderGraph ? '':
                (<div className='App disply-graph' > 
                          
                          <Graph 
                            id="graph-id" // id is mandatory
                            data={graphData}
                            config={myConfig}
                            onMouseOverNode={onMouseOverNode}
                          />
        
                        <ToastContainer
                              autoClose={2000}
                              hideProgressBar={false}
                              newestOnTop={false}
                              closeOnClick
                              rtl={false}
                              pauseOnFocusLoss
                              draggable
                              pauseOnHover
                              theme="light"
                              style={{width: '500px'}}
                        />
                </div>)
            }
            </div>   
        </div>
    );
}
export default DashboardGraph;