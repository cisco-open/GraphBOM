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



const RenderVulnerabilities = ({params}) => {

    const [gitrepo, setGitRepo] = useState('');
    const [msg, setMsg] = useState('');
    const [isError, setError] = useState(false);
    const [btnState, setButState] = useState(true);
    const [rowData, setRowData] = useState([]);
    const sbom = 'scan';


    const renderHyperLink = (props) => {
        let source_url = props.value;
        if (source_url !== "Not Found"){
            return(
                <div>
                    <a href={source_url} target="_blank" rel="noopener noreferrer">{source_url}</a>
                </div>
            )
        }else{
            return(source_url)
        }
    }

    const colors = [ '#a50f0f', '#eb8448', '#9bdbbc']

    const renderSeverity = (props) => {
        let severity = props.value;
        if (severity === 'High'){
            return (
                <div style={{backgroundColor:'#a50f0f', color:'white'}}>
                        {severity}
                </div>
            )
        }
        else if (severity === 'Medium'){
            return (
                <div style={{backgroundColor:'#eb8448', color:'white'}}>
                        {severity}
                </div>
            )
        }else if (severity === 'Low'){
            return (
                <div style={{backgroundColor:'#9bdbbc', color:'white'}}>
                        {severity}
                </div>
            )
        }
    }

    const columnDefs = [
        {headerName: "Row#", field: 'id', cellRendererFramework: (params)=>{return <span>{params.rowIndex+1}</span>}},
        {headerName: "Package ID", field: "pack_name"},
        {headerName: "Package Url", field: "location" },
        {headerName: "CVE-ID", field: "cve_id"},
        {headerName: "Source Url", field: "source_url", cellRenderer: renderHyperLink},
        {headerName: "Severity", field: "severity", cellRenderer: renderSeverity},
        {headerName: "Description", field: "description"},
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
                    setMsg("No vulnerabilities found..!")
                    setError(true);
                    setRowData([]);
                    setGitRepo('');
                }else if(typeof response.data === 'object' && response.data !== "None" ){
                    toast.success("Rendering the Details..!");
                    setRowData(response.data);
                    setGitRepo('');
                    setMsg('');
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
            setMsg('');
        }else{
            setGitRepo('');
            setButState(true);
            setError(true);
            setMsg('');
        }

    }

    const severityLevel = {
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: 'bold'
    }



    return(

        <div>
            <header className='App'>
                <h1>Vulnerabilities of GitHub Repo</h1>
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
            <div style={{width:'20%', margin:'0 auto'}}>
                <h2>Severity Level</h2>
                <div style={severityLevel}>
                    {colors.map((color) => (
                        <div key={color} style={{backgroundColor: color, height:'10px', width:'40px', borderRadius:'5px' }} />
                    ))}
                </div>
                <div style={severityLevel}>
                    <div>Hight</div>
                    <div>Medium</div>
                    <div>Low</div>
                </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', padding:'2%'}}>
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
export default RenderVulnerabilities;