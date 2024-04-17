/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../../App.css'
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import {Button} from 'semantic-ui-react';
import { ToastContainer, toast } from 'react-toastify';


const BlockChain = ({params}) => {

    const history = useHistory();
    const [rowData, setRowData] = useState([]);

    const host_add = process.env.REACT_APP_HOST_IP;
    const port_add = process.env.REACT_APP_HOST_PORT;

    const renderHyperLink = (props) =>{
        let txnHash = props.value
        console.log(txnHash);
        return(
            <div>
                <a href={txnHash} target="_blank" rel="noopener noreferrer">{txnHash}</a>
            </div>
        )
    }


    const fetchBlockChain = async (repo) =>{
        try{
            debugger;
            const fetch_all_txnsHash = await axios.post(`http://`+`${host_add}`+":"+`${port_add}`+'/deleteRepoinBlockChain',{
                    repo: repo
            }, 3000);
            let txnsHash = fetch_all_txnsHash.data;
            setRowData(txnsHash);
        }catch(error){
            console.log(error);
        }
    }

    const buttonClicked =  (repo) => {    
        console.log("Clicke the button..!" + repo);
        fetchBlockChain(repo);
    };

    const columnDefs = [
        {headerName: "Row#", field: 'id', width: 100, cellRenderer: (params)=>{return <span>{params.rowIndex+1}</span>}},
        {headerName: "Repo Name", field: "repo",width: 300, },
        {headerName: "Trsaction Hash", field: "txnHash", width: 600, cellRenderer: renderHyperLink },
        {headerName: "", field: "repo", width: 180, cellRenderer: (params)=>{console.log(params.data.repo); return (<Button negative size='tiny' onClick={() => buttonClicked(params.data.repo)} >DeleteRepo</Button>)} },
    ];

    const getAllReposFromBlockchain = async () =>{
        try{
            const fetch_txnsHash = await axios.get(`http://`+`${host_add}`+":"+`${port_add}`+'/getAllBlockChainHash',{
            }, 3000);
            if (typeof fetch_txnsHash.data === 'string'){
                toast.error(fetch_txnsHash.data);
            }else{
                let txnsHash = fetch_txnsHash.data;
                toast.success('Rendering Data..!');
                setRowData(txnsHash);
            }
        }catch(error){
            console.log(error);
        }
    }

    useEffect(()=>{
        if (history.location.state){
            console.log(history.location.state.txnData);
            setRowData(history.location.state.txnData);
        }
        getAllReposFromBlockchain();

    }, []);


    const defaultColDef = useMemo(() => {
        return {
            resizable: true,
            filter: true,
            // flex: 1,
        };
        }, []);

    const gridOptions = {
        enableCellTextSelection: true,
        ensureDomOrder: true,
        pagination: true,
    }

    return(
        <div className='App'>

           {/* <b> Blockchaind Hex ID:  &nbsp; &nbsp;</b> <a href={hexId} target="_blank" rel="noopener noreferrer">Transaction ID</a> */}
           <div style={{display: 'flex', justifyContent: 'center', padding:'2%'}}>
                <div className="ag-theme-alpine" style={{height: '600px', width: '1200px', textAlign: 'left' }}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        gridOptions={gridOptions}
                        >
                    </AgGridReact>
                </div>
            </div>
            <ToastContainer
                      autoClose={3000}
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
        </div>
    )

}
export default BlockChain;