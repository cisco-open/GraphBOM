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
import Plot from 'react-plotly.js';
import { Table, Button } from 'semantic-ui-react';

const DashboardCryptoDetector = ({params}) => {

    const [gitrepo, setGitRepo] = useState('');
    const [rowData, setRowData] = useState([]);
    const [pieData, setPieData] = useState();
    const [tableData, setTableData] = useState('');
    const [erroMsg, setErrorMsg] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const gridRefCrypto = useRef();

    
    const renderHyperLink = (param) =>{
        return (
            <div>
                <a href={param.value} target="_blank" rel="noopener noreferrer">{param.value}</a>
            </div>
        )
    }

    const columnDefs = [
        {headerName: "Row#", field: 'id', width:100, cellRenderer: (params)=>{return <span>{params.rowIndex+1}</span>}},
        {headerName: "File Location", field: "file_path", wrapText: true, autoHeight: true, width:300,  cellRenderer: renderHyperLink},
        {headerName: "Crypto Keyword Matched", field: "matched_text", wrapText: true, autoHeight: true,},
        {headerName: "Quantum-safe", field: "quantum_safe", wrapText: true, autoHeight: true,},
        
    ];

    const defaultColDef = useMemo(() => {
        return {
            resizable: true,
            filter: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
        };
        }, []);

    const gridOptions = {
        enableCellTextSelection: true,
        ensureDomOrder: true,
        pagination: true,
        paginationAutoPageSize: false,
        paginationPageSize: 10
    }

    
    useEffect(() => {
        if(params.rowData.length > 0 && params.rowData !== "None"){
            setRowData(params.rowData[0]);
            let piData = params.rowData[1];
            setPieData(piData);
            if (params.rowData[2] != undefined){
                setTableData(params.rowData[2][0]);
            }
            setIsLoaded(true);
        }
        else if (params.rowData === "None" || params.rowData.length === 0){
            setErrorMsg('No Audits found for '+ params.repo);
            setIsLoaded(false);
        }
         setGitRepo(params.repo);
    },[params]);

    const onBtnExportCrypto = useCallback(() => {
        gridRefCrypto.current.api.exportDataAsCsv(params={fileName: 'Crypto-detector.csv'});
      }, []);


    return(
        <div>
            <header>
                <h1>Crypto Detector of {gitrepo}</h1>
            </header>

            <div className='App'>
                { isLoaded ? '' : erroMsg }
            </div>

            <div>
                <Button primary onClick={onBtnExportCrypto} floated='right'>
                        Download CSV export file
                </Button>
            </div>
            
            { isLoaded ? 
                (<div style={{display: 'flex', justifyContent: 'center', padding: '2%'}}>

                    <div className="ag-theme-alpine" style={{height: '600px', width: '800px', textAlign: 'center' }}>
                            <AgGridReact
                                ref={gridRefCrypto}
                                columnDefs={columnDefs}
                                rowData={rowData}
                                defaultColDef={defaultColDef}
                                gridOptions={gridOptions}
                                suppressRowTransform={true}
                                >
                            </AgGridReact>
                    </div>

                    <div style={{disply: 'flex', flexDirection:'column'}}>
                    <Plot
                        data={pieData}
                        layout={ {width: 400, height: 400, title: 'Risk-Factor for Safe/Unsafe'} }
                    />
                    <div style={{fontSize: '14px', marginLeft: '10%'}}>
                    <Table celled>
                        <Table.Body>
                            <Table.Row >
                                <Table.Cell positive><b>Safe:</b> {tableData.Safe}</Table.Cell>
                                <Table.Cell warning><b>Unsafe:</b> {tableData.Unsafe}</Table.Cell>
                                <Table.Cell negative><b>Need to Work:</b> {tableData.Need_to_work}</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table> 
                    </div>
                    </div>

                </div>)
                : ''
            }

        </div>
    );
}
export default DashboardCryptoDetector;