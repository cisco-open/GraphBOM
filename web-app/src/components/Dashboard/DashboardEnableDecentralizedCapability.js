/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useEffect, useState } from 'react';
import '../../App.css';
import { Radio, Button, Form } from 'semantic-ui-react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';


const DashboardEnableDecentralizedCapability = ({params, chooseMessage}) => {

    const [blockChain, setBlockChiain] = useState('');
    const [hashObj, setHashObj] = useState([]);
    const [errmsg, setMsg] = useState();

    const history = useHistory()
    const name = "Blockchain"
    const host = process.env.REACT_APP_HOST_IP;
    const port = process.env.REACT_APP_HOST_PORT;

    const onSubmit = async (e) => {
        e.preventDefault();

        if(hashObj){
            try{
                const blockchianId = await axios.post(`http://`+`${host}`+":"+`${port}`+'/getBlockChain',{
                    hashObj: hashObj
                }, 3000);
                debugger;
                if(blockchianId.data){
                    try{
                        const fetch_all_txnsHash = await axios.get(`http://`+`${host}`+":"+`${port}`+'/getAllBlockChainHash',{
                        }, 3000);
                        let txnsHash = fetch_all_txnsHash.data;
                        history?.push('/blockchain', {'txnData': txnsHash})
                    }catch(error){
                        console.log(error);
                    }
                }else{
                    let msg =<div><b>This project is already exists in the Blockchain..! <br /> You can not add the project..!</b></div>
                    toast.error(msg);
                    chooseMessage(false)
                }
            }catch (error) {
                console.log(error);
                setMsg(error.message +' Check console..!');
              }
        }
    
    };



    const handleCheckBox = (e, data) =>{
        setBlockChiain(data.value);
    }

    useEffect(()=>{
        setHashObj(params.hashObj);
        console.log(params.hashObj);
    },[params])

    
    return(
        
        <div className='App'>
            
            <Form >
                <div style={{display: 'flex', flexDirection: 'column', marginBottom:'2%'}}>
                    {/* <Form.Field control={Radio}  label='Permissioned Hyperledger'  onClick={handleCheckBox} value="hyperledger" /> */}
                    <Form.Field control={Radio} label='Permissionless Ethereum' onClick={handleCheckBox} value="ethereum" />
                </div>
                    <Button primary size='small' type="submit" onClick={onSubmit}> Submit </Button>
                    
            </Form>
            
        </div>
    )

}


export default DashboardEnableDecentralizedCapability;