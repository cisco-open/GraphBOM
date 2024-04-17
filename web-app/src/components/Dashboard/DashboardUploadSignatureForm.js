/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useState } from 'react';
import '../../App.css';
import { Button, Form } from 'semantic-ui-react'


const UploadSignatureForm = () => {

    const [email, setEmail] = useState();
    const [digitalSig, setDS] = useState();
    const [publicKey, setPK] = useState();
    const [cipherSuit, setCS] = useState();
    const [verifySig, setVS] = useState();
    const [repoUrl, setRepoUrl] = useState();
    const [repoName, setRepoName] = useState();
    const [isUrlValid, setIsUrlValid]  = useState(false);
    const [isEmailValid, setIsEmailValid]  = useState(false);
    const [message, setMessage] = useState('');
    const [mesEmail, setEmailMessage] = useState('');
    const [isRepoName, setIsRepoName] = useState(false);
    const [msgReponame, setRepoNameMessage] = useState('');
    const [isDigitalSign, setIsDigitalSign] = useState(false);
    const [msgDigitalSign, setMsgDigitalSign] = useState('');
    const [isPublicKey, setIsPublicKey] = useState(false);
    const [msgPublicKey, setMsgPublicKey] = useState('');
    const [isCipherKey, setIsCipherKey] = useState(false);
    const [msgCipherKey, setMsgCipherKey] = useState('');
    const [isVerifySign, setIsVerifySign] = useState(false);
    const [msgVerifySign, setMsgVerifySign] = useState('');
    const [btnDisable, setBtnDisable] = useState(true);


    let expr = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i

    const validateUrl = (repoUrl) => {
        if (!repoUrl) return false;
        const match = repoUrl.match(
            /^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/
        );
        if (!match || !(match.groups?.owner && match.groups?.name)) return false;
        setIsRepoName(`${match.groups.owner}/${match.groups.name}`);
        // return `${match.groups.owner}/${match.groups.name}`;
        return true;
    } 

    const checkRepo =  (repoUrl, reponame) => {
        if (!repoUrl || !reponame) return false;
        const match = repoUrl.match(
            /^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/
        );

        if (`${match.groups.name}` === reponame) return true;
        return false
    }

    const validateEmail = (email) => {
            if (!email) return false;
            let re = /^\S+@\S+\.\S+$/;
            if (!re.test(email) ) 
                return false;
            else
                return true;
    }

    const validDigitalSign = (ds) =>{
        if (!ds) return false;
        if(expr.test(ds))  
            return true;
        else
            return false;  
    }

    const validPublicKey = (pk) => {
        if (!pk) return false;
        if(expr.test(pk))  
            return true;
        else
            return false;  
    }

    const validCipherKey = (ck) => {
        if (!ck) return false;
        if(expr.test(ck))  
            return true;
        else
            return false; 
    }

    const validVerifySign = (vs) => {
        if (!vs) return false;
        
        if(expr.test(vs))  
            return true;
        else
            return false; 
    }

    const onSubmit = (e) => {
        e.preventDefault();

        const isEmailValid = validateEmail(email);
        setIsEmailValid(isEmailValid);
        if(!isEmailValid){
            setEmailMessage("not a valid email");
            setIsEmailValid(false);
        }

        const isDigitalSign = validDigitalSign(digitalSig);
        setIsDigitalSign(isDigitalSign);
        if(!isDigitalSign){
            setMsgDigitalSign('not a valid pattern..!');
            setIsDigitalSign(false);
        }
        
        const isPublicKey = validPublicKey(publicKey);
        setIsPublicKey(isPublicKey);
        if(!isPublicKey){
            setMsgPublicKey("not a valid pattern..!");
            setIsPublicKey(false);
        }
        
        const iscipherSuit = validCipherKey(cipherSuit);
        setIsCipherKey(iscipherSuit);
        if(!iscipherSuit){
            setMsgCipherKey("not a valid pattern..!");
            setIsCipherKey(false);
        }
        
        const isVerifySig = validVerifySign(verifySig);
        setIsVerifySign(isVerifySig);
        if(!isVerifySig){
            setMsgVerifySign("not a valid pattern..!");
            setIsVerifySign(false);
        }
        
        const isUrlValid = validateUrl(repoUrl);
        setIsUrlValid(isUrlValid);
        if(!isUrlValid){
            setMessage("not a valid url");
            setIsUrlValid(false);
        }

        const isRepoName = checkRepo(repoUrl, repoName);
        setIsRepoName(isRepoName);
        if(!isRepoName){
            setRepoNameMessage('Repo names are not matching..!');
            setIsRepoName(false);
        }

        let formParams = {
            email: email,
            ds: digitalSig,
            pk: publicKey,
            cs: cipherSuit,
            vs: verifySig,
            repourl: repoUrl,
            reponame: repoName
        }
        console.log(formParams);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setEmailMessage('');
    }
    const handleDSChange = (e) => {
        setDS(e.target.value);
        setMsgDigitalSign('');
    }
    const handlePKChange = (e) => {
        setPK(e.target.value);
        setMsgPublicKey('');

    }
    const handleCSChange = (e) => {
        setCS(e.target.value);
        setMsgCipherKey('');
    }
    const handleVSChange = (e) => {
        setVS(e.target.value);
        setMsgVerifySign('');
    }
    const handleRepoUrlChange = (e) => {
        setRepoUrl(e.target.value);
        setMessage('');
    }
    const handleRepoNameChange = (e) => {
        setRepoName(e.target.value);
        setRepoNameMessage('');
        setBtnDisable(false);
    }

    const handleResetForm = () =>{
        debugger;
        setEmail('');
        setDS('');
        setPK('');
        setCS('');
        setVS('');
        setRepoUrl('');
        setRepoName('');
        setIsUrlValid(false);
        setMessage('');
        setIsEmailValid(false);
        setEmailMessage('');
        setMsgDigitalSign('');
        setRepoNameMessage('');
        setIsRepoName(false);
        setMsgPublicKey('');
        setIsPublicKey(false);
        setMsgCipherKey('');
        setIsCipherKey(false);
        setMsgVerifySign('');
        setIsVerifySign(false);
        setBtnDisable(true);
        
    }


    return(
        
        <div >
            <Form >
                <Form.Input 
                        label="Email"
                        type="email"
                        value={email}
                        placeholder="Email" 
                        onChange={handleEmailChange} 
                       />
                       {mesEmail && <p style={isEmailValid ? {color:''}:{color:'red'} }>{mesEmail}</p>}
                <Form.Input 
                        label="Digital Signature"
                        type="text" 
                        value={digitalSig}
                        placeholder="Digital Signature" 
                        onChange={handleDSChange} 
                        />
                        {msgDigitalSign && <p style={isDigitalSign ? {color:''}:{color:'red'} }>{msgDigitalSign}</p>}

                <Form.Input 
                        label="Public Key"
                        type="text" 
                        placeholder="Public Key"  
                        value={publicKey}
                        onChange={handlePKChange} 
                        />
                        {msgPublicKey && <p style={isPublicKey ? {color:''}:{color:'red'} }>{msgPublicKey}</p>}

                <Form.Input 
                        label="CipherSuite"
                        type="text"
                        placeholder="CipherSuite" 
                        value={cipherSuit}
                        onChange={handleCSChange} 
                        // error={csError}
                         />
                        {msgCipherKey && <p style={isCipherKey ? {color:''}:{color:'red'} }>{msgCipherKey}</p>}
                <Form.Input 
                        label="Verify Signature"
                        type="text" 
                        placeholder="Verify Signature" 
                        value={verifySig}
                        onChange={handleVSChange}
                        // error={vsError}
                        />
                        {msgVerifySign && <p style={isVerifySign ? {color:''}:{color:'red'} }>{msgVerifySign}</p>}
                <Form.Input 
                        label="Repo Url"
                        type="text" 
                        placeholder="Repo Url"
                        value={repoUrl}
                        onChange={handleRepoUrlChange}
                        />
                        {message && <p style={isUrlValid ? {color:''}:{color:'red'} }>{message}</p>}

                <Form.Input 
                        label="Repo Name"
                        type="text" 
                        placeholder="Repo Name"
                        value={repoName}
                        onChange={handleRepoNameChange}                        />
                        {msgReponame && <p style={isRepoName ? {color:''}:{color:'red'} }>{msgReponame}</p>}
                
                <Button primary size='small' type="submit"  onClick={onSubmit} disabled={btnDisable}> Submit </Button>
                <Button primary size='small' onClick={handleResetForm}> Reset </Button>
            </Form>
            
            
        </div>
    )

}


export default UploadSignatureForm;