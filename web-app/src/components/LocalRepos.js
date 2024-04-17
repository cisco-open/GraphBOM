/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useMemo, useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import { Input, Button} from 'semantic-ui-react'
import { ToastContainer, toast } from 'react-toastify';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import renderButton  from './renderButton';

const LocalRepos = ({params}) => {

    const [gitrepo, setGitRepo] = useState('');
    const [msg, setMsg] = useState('');
    const [isError, setError] = useState(false);
    const [btnState, setButState] = useState(true);
    const [rowData, setRowData] = useState([])
    
    const host = process.env.REACT_APP_HOST_IP;
    const port = process.env.REACT_APP_HOST_PORT;

    const columnDefs = [
            {headerName: "Row#", field: 'id', width: 100, cellRendererFramework: (params)=>{return <span>{params.rowIndex+1}</span>}},
            {headerName: "Hash", field: 'hash'},
            {headerName: "Reponame", field: "repo"},
            {headerName: "Timestamp", field: "timestamp"},
            {headerName: "Configurations", field: "ratelimits"},
            {headerName: "", field: 'hash', cellRenderer: renderButton}
        ];
  
    const defaultColDef = useMemo(() => {
        return {
            sortable: true,
            resizable: true,
            filter: true,
            flex: 1
        };
        }, []);

    const SubmitGetRepoDetails = async () => { 
        // e.preventDefault();
          try{
              const response = await axios.post("http://"+`${host}`+":"+`${port}`+'/GetAvailableGraphs', {
                gitrepo: params.repo
              });
              if (response.data.length === 0){
                    setMsg("No results found..!")
                    setError(true);
              }else if(typeof response.data === 'object' && response.data !== "None" ){
                // toast.success("Rendering the Details..!");
                setRowData(response.data);
              }
              else{
                setError(true);
                setMsg("Invalid GitHub URL");
                setButState(true);
                setGitRepo('')
              }
              
          }catch (error) {
            setMsg(error.response);
            setError(true)
          }
    }

    useEffect(() => {
      debugger
      if(params){
        setGitRepo(params.repo);
        SubmitGetRepoDetails()
      }
    },[params]); 


    // const handleChange = (e) => {
    //   if(e.target.value.length > 0){
    //       setGitRepo(e.target.value);
    //       setButState(false);

    //     }else{
    //       setGitRepo('');
    //       setButState(true)
    //       setError(true)
    //       setMsg('')
    //     }
    // }

    return (
        <div> 
            <header className='App'>
                <h1>History</h1>
            </header>
    
            <div className='App'>
                {/* <form onSubmit={SubmitGetRepoDetails} method="post"> */}
                {/* <div className='input-url'>
                    <label><b>GitHub</b> (url/.git) &nbsp;&nbsp;</label>
                        <Input focus type="text" 
                        required
                        placeholder="git repo url" 
                        value={gitrepo} 
                        name={gitrepo}
                        onChange={handleChange}
                        style = {{width: "300px"}}
                        />&nbsp;&nbsp;
                        <Button primary size='big' disabled={btnState}> Submit </Button>
                </div> */}
                {/* </form> */}
                {/* <p  id="msg" style={{padding:'1%'}} className={isError ? 'error' : 'success'}>{msg}</p>
                <ToastContainer
                      autoClose={1000}
                      hideProgressBar={false}
                      newestOnTop={false}
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="light"
                      style={{width: '300px'}}
                /> */}
            </div>

            <div style={{display: 'flex', justifyContent: 'center'}}>
                <div className="ag-theme-alpine" style={{height: '500px', width: '1000px', textAlign: 'center' }}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        >
                    </AgGridReact>
                </div>
            </div>
        </div>
      );


}

export default LocalRepos;

