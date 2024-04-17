/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, {  useState } from 'react';
import '../../App.css';
import {  Icon, Button, Dimmer, Loader, Image, Form, TableHeader, Table, TableRow, TableHeaderCell} from 'semantic-ui-react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Graph } from "react-d3-graph";
import  {myConfig} from '../GraphConfig';
import axios from 'axios';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const DashboardBinaryImageScanner = () => {

    const [binaryGraphData, setBinaryGraphData] = useState([]);
    const [binaryGraphMsg, setBinaryGraphMsg] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [nodes, setNodesCnt] = useState(0)
    const [edges, setEdgesCnt] = useState(0)

    const host = process.env.REACT_APP_HOST_IP;
    const port = process.env.REACT_APP_HOST_PORT;

    
    const getBinaryImage = async (e) =>{
      e.preventDefault();
      setLoading(true);
      toast.warning("Fetching details..!");
      // const binaryImageTag = new FormData();
      // binaryImageTag.append("file", binaryImage);
      try{
        const binaryImageRes = await axios.get("http://"+host+":"+port+'/GetBinaryImageScanner');
        console.log(binaryImageRes.data);
        if(binaryImageRes.data === "None"){
            setLoading(false);
            setBinaryGraphData([]);
            setBinaryGraphMsg("Connection Refused or Server is not started...! Please check the Binary Server app.py is running or not.")
            toast.error("Server not running or Connection Refused ...!")
        }else{
          setNodesCnt(binaryImageRes.data.nodes.length);
          setEdgesCnt(binaryImageRes.data.links.length);
          if (binaryImageRes.data.nodes.length <= 100){
            toast.success("Rendering the Data..!");
            setBinaryGraphData(binaryImageRes.data);
            setLoading(false);
          }else{
            setLoading(false);
            setBinaryGraphData([]);
            setBinaryGraphMsg("Graph has more than 100 nodes. It can't be rendered...!")
          }
        }
        
        
      }catch(error){
        setLoading(false);
        setBinaryGraphData([]);
        setBinaryGraphMsg(error.message);
        console.log(error.message);
      }
    }

    return(
        <div>
            <Dimmer active={isLoading}>
                <Loader active >Preparing Data</Loader>
            </Dimmer>
            <div className='App'>
            <header>
                  <h1>GraphBOM: A platform for Software Supply Chain Security</h1>
              </header> 

            <Form  method="post" encType="multipart/form-data">
                {/* {<p style={fileError ? {display:'inline-block', color:'red'}: {display:'none', color:''}}>{fileError}</p> } */}

                <Button primary size='small'  type="submit" onClick={getBinaryImage}> FetchGraph </Button>
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
            </Form>

            {binaryGraphData.length <= 0 ? <p style={{color:'red', fontSize:'16px', padding:'4%'}}> {binaryGraphMsg} </p>:
            
                (
                  <div className='App' style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <div style={{marginTop:'2%', width:"20%", }}>
                    <Table celled>
                          <TableHeader>
                            <TableRow>
                              <TableHeaderCell>Nodes</TableHeaderCell>
                              <TableHeaderCell>Edges</TableHeaderCell>
                              <TableHeaderCell>Possible Bug/Failure</TableHeaderCell>
                            </TableRow>
                          </TableHeader>
                          <Table.Body>
                          <Table.Row>
                            <Table.Cell>
                              {nodes}
                            </Table.Cell>
                            <Table.Cell>
                              {edges}
                            </Table.Cell>
                            <Table.Cell>
                            <Icon name='circle' color='red' size='big'/> Node
                            </Table.Cell>
                          </Table.Row>
                          </Table.Body>
                        </Table>
                  </div>
                  <div className='disply-graph' > 
                      <Graph 
                        id="graph-id" // id is mandatory
                        data={binaryGraphData}
                        config={myConfig}
                        // onMouseOverNode={onMouseOverNode}
                      />
                  </div>
                </div>)
            }
            
          </div>
        </div>
    );
}
export default DashboardBinaryImageScanner;