/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { Button, Form, Grid, Segment, Input, TextArea} from 'semantic-ui-react';

const DashboardSign = ({params}) => {

    const [hashVal, setHashVal] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [signAlgo, setSignAlgo] = useState('');
    const [fileError, setFileError] = useState('');
    const [message, setMessage] = useState('');
    const [algoError, setAlgoError] = useState('');
    const [flag, setFlag] = useState(false);
    const [btnState, setButState] = useState(true);
    const [status, setStatus] = useState('');
    const [signedSignature, setSignedSignature] = useState('');
    const fileRef = useRef(null);

    const host = process.env.REACT_APP_HOST_IP;
    const port = process.env.REACT_APP_HOST_PORT;

    const signAlgoOption = [
        { key: 'rsa', text: 'RSA', value: 'RSA' },
        { key: 'ecdsa', text: 'ECDSA', value: 'ECDSA'},
    ]

    const onSubmit = async (e) => {
        e.preventDefault();
        if(privateKey === null || privateKey === ''){
            setFileError("Please upload private key file.");
        }if(signAlgo === '' || signAlgo === null){
            setAlgoError('Please select Algorithm');
        }else if (signAlgo !== '' && privateKey !== ''){
            const data = new FormData();
            data.append('file_from_react', privateKey);
            data.append('hashValue', hashVal);
            data.append('algo', signAlgo);

            try{
                const response = await fetch("http://"+`${host}`+":"+`${port}`+'/uploadSign', {
                    method:'post',
                    body: data
                }).then((res) => (res.json()));
                if(response.status){
                    setStatus(response.status);
                    setSignedSignature(response.status);
                    setFlag(true);
                    setPrivateKey('');
                    setSignAlgo('');
                    fileRef.current.inputRef.current.value = null;
                    setSignAlgo('');
                }if(response.error){
                    setStatus(response.error);
                    setMessage(response.error);
                    setFlag(true);
                    setSignedSignature('');
                }
            }catch (error) {
                console.log(error.message);
              }
        }
        
    };

    const handleFileUpload = (e) => {
        let filePrivate = e.target.files[0];
        if (filePrivate === undefined){ 
            setFileError("Please upload the signed Key");
            setPrivateKey('');
            setSignedSignature('');
        }else{
            setPrivateKey(filePrivate);
            setFileError('');
            setFlag(false);
            setMessage('');
            setSignedSignature('');
        }
    }

    const handleSignAlgo = (event, data) => {
        let algo = data.value;
        if (algo){
            setSignAlgo(algo);
            setAlgoError('');
            setMessage('');
        }
        else{
            setAlgoError('Please select Algorithm');
            setSignedSignature('');
        }
    }


    useEffect(() => {
        if(params){
            setHashVal(params);
            setButState(false);
            setSignedSignature('');
        }
    },[params]); 

    // const signatureStyle = {
    //     display: 'inline-block',
    //     border: 'solid 1px black',
    //     overflowWrap:'anywhere',
    //     minWidth: '50%',
    //     maxWidth: '100%'
    // }

    return(
        
        <div style={{margin:'0 auto'}}>
            {
                status === 1 ?
                <p style={flag ?  {display:'inline-block', color:'green', textAlign:'center', fontSize:'16px'}: {display:'none', color:''} }>{message}</p>
                :
                <p style={flag ?  {display:'inline-block', color:'red', textAlign:'center', fontSize:'16px'}: {display:'none', color:''} }>{message}</p>
            }

            <Form encType="multipart/form-data" method='post'>
                    <h5>Graph Hash: <Input disabled value={hashVal} style={{width:'85%'}}/></h5>                  
                    <Segment >
                        <Grid columns={2} stackable textAlign='center' >
                                <Grid.Row>
                                    <Grid.Column>
                                    {<p style={params && algoError ? {display:'inline-block', color:'red'}: {display:'none', color:''}}>{algoError}</p> }
                                        <h5 style={{marginBottom:'6%'}}>Select Signing Cipher</h5>
                                        <Form.Select
                                            fluid
                                            options={signAlgoOption}
                                            placeholder='Sign Algorithm'
                                            onChange={handleSignAlgo}
                                            value={signAlgo}
                                        />
                                    </Grid.Column>
                                    <Grid.Column>
                                    {<p style={params && fileError ? {display:'inline-block', color:'red'}: {display:'none', color:''}}>{fileError}</p> }
                                       <h5>Upload Signed Key (Ex: .pem, .der)</h5>
                                        <Input
                                            id="filePicker"
                                            type='file'
                                            onChange={handleFileUpload}
                                            accept=".pem,.der,.p8,.p7b,.p12,.jks"
                                            ref={fileRef}
                                        />  
                                    </Grid.Column>

                                </Grid.Row>
                                <Grid.Row style={{display:'initial', textAlign:'right'}}>
                                    <Button  primary size='small' type="submit" onClick={onSubmit} disabled={btnState}>Submit and Sign</Button>
                                </Grid.Row>
                        </Grid>
                        
                    </Segment>
            </Form>

            <div style={{marginTop:'5%'}}>
                {signedSignature ? <div> <h5>Signature for the repo:</h5>
                                    <TextArea rows='15' value={signedSignature} style={{width:'100%'}} readOnly />
                                </div>        
                    :
                    ''
                }
            </div>
            
        </div>
    )

}


export default DashboardSign;