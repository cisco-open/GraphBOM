/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useMemo, useState } from 'react';
import '../App.css';
import axios from 'axios';
import { Input, Button } from 'semantic-ui-react'
import { ToastContainer, toast } from 'react-toastify';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';



const RenderSBOM = () => {

    const [gitrepo, setGitRepo] = useState('');
    const [msg, setMsg] = useState('');
    const [isError, setError] = useState(false);
    const [btnState, setButState] = useState(true);
    const [rowData, setRowData] = useState([]);
    const sbom = 'sbom';

    const columnDefs = [
        {headerName: "Row#", field: 'id', cellRendererFramework: (params)=>{return <span>{params.rowIndex+1}</span>}},
        {headerName: "SPDX ID", field: "SPDXID"},
        {headerName: "Package Url", field: "sourec_url" },
        {headerName: "Package Manager", field: "externalRefs"},
        {headerName: "Manifest Info", field: "sourceInfo"},
        {headerName: "Package Version", field: "versionInfo"},
    ];

    const defaultColDef = useMemo(() => {
        return {
            resizable: true,
            filter: true,
            flex: 1,
        };
        }, []);

    const gridOptions = {
        enableCellTextSelection: true,
        ensureDomOrder: true,
        pagination: true,
    }

    const SubmitGetRepoDetails = async (e) => { 
        e.preventDefault();
            try{
                toast.warn("Trying to fetch details..!");
                    const response = await axios.post('http://localhost:5000/GetSBOM', {
                        gitrepo: gitrepo,
                        sbom: sbom
                });
                if (response.data.length === 0){
                    setMsg("SBOM can not be generated..!")
                    setError(true);
                    setRowData([]);
                    setGitRepo('');
                }else if(typeof response.data === 'object' && response.data !== "None" ){
                    toast.success("Rendering the Details..!");
                    setRowData(response.data);
                    setGitRepo('');
                    setMsg('')
                }else{
                    setError(true);
                    setMsg("Invalid GitHub URL");
                    setButState(true);
                    setGitRepo('');
                }
                
            }catch (error) {
            setMsg(error.response);
            setError(true)
            }
    }


    const handleChange = (e) => {
        if(e.target.value.length > 0){
            setGitRepo(e.target.value);
            setButState(false);
            setRowData([]);
        }else{
            setGitRepo('');
            setButState(true)
            setError(true)
            setMsg('')
        }

    }

    return(

        <div>
            <header className='App'>
                <h1>SBOM of GitHub Repo</h1>
            </header>
            
            <div className='App'>
                <form onSubmit={SubmitGetRepoDetails} method="post">
                <div className='input-url'>
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
                </div>
                </form>
                <p  id="msg" style={{padding:'1%'}} className={isError ? 'error' : 'success'}>{msg}</p>
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
                />
            </div>

            <div style={{display: 'flex', justifyContent: 'center'}}>
                <div className="ag-theme-alpine" style={{height: '600px', width: '1200px', textAlign: 'center' }}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        gridOptions={gridOptions}
                        >
                    </AgGridReact>
                </div>
            </div>

        </div>
    );

}
export default RenderSBOM;