/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import '../../App.css';
import {  Button, Input, Dimmer, Loader, Image} from 'semantic-ui-react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const DashboardContainerScanner = () => {

    const [binaryGraphData, setBinaryGraphData] = useState('');
    const [binaryGraphMsg, setBinaryGraphMsg] = useState('');
    const [renderBinaryGraph, setRenderBinaryGraph] = useState(true);
    const gridRefImg = useRef();
    const gridRefVul = useRef();
    const [imageTag, setImageTag] = useState('');
    const [btnState, setButState] = useState(true);
    const [vulnerabilityRow, setVulnerabilityRow] = useState([]);
    const [rowDataSummary, setRowDataSummary] = useState([]);
    const [isLoading, setLoading] = useState(false);


    const host = process.env.REACT_APP_HOST_IP;
    const port = process.env.REACT_APP_HOST_PORT;

    
    const getContainerImage = async (e) =>{
      e.preventDefault();
      setLoading(true);
      toast.warning("Fetching details..!");
      try{
        const binaryContainerRes = await axios.post("http://"+host+":"+port+'/GetContainerScanner', {
          'imageTag':imageTag
        }, 3000);
        toast.success("Rendering the Data..!");
        debugger
        if(typeof(binaryContainerRes.data) !== 'object'){
          setLoading(false);
          setBinaryGraphMsg(binaryContainerRes.data)
          setBinaryGraphData();
          setVulnerabilityRow();
          setRowDataSummary();
        }else{
          setLoading(false);
          console.log(binaryContainerRes.data);
          setRenderBinaryGraph(false);
          setBinaryGraphMsg();
          setBinaryGraphData(binaryContainerRes.data.sbom);
          setVulnerabilityRow(binaryContainerRes.data.vul);
          setRowDataSummary(binaryContainerRes.data.params);
        }
        
      }catch(error){
        console.log(error.message);
      }
    }

    const columnDefs = [
      {headerName: "Row#", field: 'id', cellRenderer: (params)=>{return <span>{params.rowIndex+1}</span>}},
      {headerName: "Package Name", field: "name"},
      {headerName: "Version", field: "version" },
      {headerName: "Source", field: "type"},
    ];

    const columnDefsVul = [
      {headerName: "Row#", field: 'id', cellRenderer: (params)=>{return <span>{params.rowIndex+1}</span>}},
      {headerName: "Package Name", field: "name"},
      {headerName: "Installed", field: "installed" },
      {headerName: "Fixed-In", field: "fixed-in"},
      {headerName: "Type", field: "type"},
      {headerName: "CVE_ID", field: "cve_id"},
      {headerName: "Severity", field: "severity"}
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

    const defaultColDefVul = useMemo(() => {
      return {
          resizable: true,
          filter: true,
          flex: 1,
      };
      }, []);

    const gridOptionsVul = {
        enableCellTextSelection: true,
        ensureDomOrder: true,
        pagination: true,
    }

    const onBtnExportImg = useCallback(() => {
      let file_name = imageTag+"_Stats.csv"
      gridRefImg.current.api.exportDataAsCsv({fileName: file_name});
    }, [imageTag]);

    const onBtnExportVul = useCallback(() => {
      gridRefVul.current.api.exportDataAsCsv({fileName: imageTag+"_Stats_Vulnarabilities.csv"});
    }, [imageTag]);

    const handleChange = (e) => {
      if(e.target.value !== undefined){
          setImageTag(e.target.value);
          setButState(false);
          setRenderBinaryGraph(true);
        }
        else{
          setButState(true);
          // setMsg("");
        }
    }

  // AG Grid styles
  const agGridStyle = {
    height: '400px', 
    width: '650px', 
    textAlign: 'left'
  }



  const columnDefs1 = [
    {headerName: "Params", field:'params', width: 210},
    {headerName: "Values", field:'values', wrapText: true, autoHeight: true, width: 430}
  ];

  const gridOptions1 = {
    enableCellTextSelection: true,
  }

    return(
        <div>
            <div className='App'>
            <header>
                  <h1>GraphBOM: A platform for Software Supply Chain Security </h1>
              </header> 

            <form onSubmit={getContainerImage} method="post">
                <div className='input-url'>
                  <label><b>Docker Image TAG</b> &nbsp;&nbsp;</label>
                      <Input focus type="text" 
                        required
                        placeholder="Docker image TAG" 
                        value={imageTag} 
                        name={imageTag}
                        onChange={handleChange}
                        style = {{width: "300px"}}
                      />&nbsp;&nbsp;
                </div>

                <Button primary size='big' disabled={btnState}> Submit </Button>
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

      <Dimmer active={isLoading}>
        <Loader active >Preparing Data</Loader>
      </Dimmer>
        </form>
            {renderBinaryGraph ? <p style={{color:'red', fontSize:"18px"}}>{binaryGraphMsg}</p> :
                (
                 <div className='App' style={{marginTop:'5%'}}>
                  <h2>{imageTag}:latest - Vulnerability Summary </h2>
                  <div style={{marginBottom:'2%', display:'flex', justifyContent:'center'}}>
                    <div className="ag-theme-alpine" style={agGridStyle}>
                        <AgGridReact
                              columnDefs={columnDefs1}
                              rowData={rowDataSummary}
                              defaultColDef={defaultColDef}
                              gridOptions={gridOptions1}
                              >
                          </AgGridReact>
                    </div>
                  </div>

                  <h2>{imageTag}:latest - SBOM </h2>
                  <Button size='medium' primary onClick={onBtnExportImg} style={{ width:'15%'}}>
                            Download CSV export file
                  </Button>
                  <div style={{display:'flex', justifyContent:'center', flexDirection: 'column'}}> 
                        <div style={{display: 'flex', justifyContent: 'center', padding:'2%'}}>
                          <div className="ag-theme-alpine" style={{height: '600px', width: '1200px', textAlign: 'center' }}>
                              <AgGridReact
                                  ref={gridRefImg}
                                  columnDefs={columnDefs}
                                  rowData={binaryGraphData}
                                  defaultColDef={defaultColDef}
                                  gridOptions={gridOptions}
                                  >
                              </AgGridReact>
                          </div>
                        </div>
                  </div>

                  <h2>{imageTag}:latest - Vulnerabilities </h2>
                  <Button size='medium' primary onClick={onBtnExportVul} style={{ width:'15%'}}>
                            Download CSV export file
                  </Button>
                  <div style={{display:'flex', justifyContent:'center', flexDirection: 'column'}}> 
                        <div style={{display: 'flex', justifyContent: 'center', padding:'2%'}}>
                          <div className="ag-theme-alpine" style={{height: '600px', width: '1200px', textAlign: 'center' }}>
                              <AgGridReact
                                  ref={gridRefVul}
                                  columnDefs={columnDefsVul}
                                  rowData={vulnerabilityRow}
                                  defaultColDef={defaultColDefVul}
                                  gridOptions={gridOptionsVul}
                                  >
                              </AgGridReact>
                          </div>
                        </div>
                  </div>

                </div>
                
                )
              }
          </div>
        </div>
    );
}
export default DashboardContainerScanner;