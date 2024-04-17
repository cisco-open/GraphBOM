/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useEffect, useMemo, useState, useRef, useCallback  } from 'react';
import '../../App.css';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Button } from 'semantic-ui-react'


const DashboardSBOM = ({params}) => {

    const [gitrepo, setGitRepo] = useState('');
    const [rowData, setRowData] = useState([]);
    const [erroMsg, setErrorMsg] = useState('');
    const [isDataLoad, setIsDataLoad] = useState(false);
    const gridRefSBOM = useRef();

    const columnDefs = [
        {headerName: "Row#", field: 'id', cellRenderer: (params)=>{return <span>{params.rowIndex+1}</span>}},
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


    useEffect(() => {
        if(params.rowData.length > 0 && params.rowData !== "None"){
            setRowData(params.rowData);
            setIsDataLoad(true);
        }
        else if (params.rowData === "None" || params.rowData.length === 0){
            setIsDataLoad(false);
            setErrorMsg('No SBOM is found for '+ params.repo);
        }
        setGitRepo(params.repo);
    },[params]);


    const onBtnExportSBOM = useCallback(() => {
        gridRefSBOM.current.api.exportDataAsCsv(params={fileName: 'SBOM.csv'});
      }, []);


    return(

        <div>
            <header>
                <h1>SBOM of {gitrepo}</h1>
            </header>
            
            <div className='App'>
                {isDataLoad ? '' : erroMsg}
            </div>
            <div>
                <Button primary onClick={onBtnExportSBOM} floated='right'>
                        Download CSV export file
                    </Button>
            </div>
            {rowData.length > 0 ?  <div style={{display: 'flex', justifyContent: 'center', padding:'2%'}}>
                <div className="ag-theme-alpine" style={{height: '600px', width: '1200px', textAlign: 'center' }}>
                    <AgGridReact
                        ref={gridRefSBOM}
                        columnDefs={columnDefs}
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        gridOptions={gridOptions}
                        >
                    </AgGridReact>
                </div>
            </div>: ''}

        </div>
    );

}
export default DashboardSBOM;