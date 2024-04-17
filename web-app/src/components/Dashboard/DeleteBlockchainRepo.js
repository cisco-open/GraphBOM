/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import axios from 'axios';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {Button} from 'semantic-ui-react';
import NavBar from '../NavBar';

export default (props) => {
  const repo = props.valueFormatted ? props.valueFormatted : props.value;
 
  const host = process.env.REACT_APP_HOST_IP;
  const port = process.env.REACT_APP_HOST_PORT;

  const history = useHistory()
  const active = 'Blockchain'

  const buttonClicked = async () => {    
    console.log("Clicke the button..!" + repo);

        try{
            const fetch_all_txnsHash = await axios.post(`http://`+`${host}`+":"+`${port}`+'/deleteRepoinBlockChain',{
                    repo: repo
            });
            let txnsHash = fetch_all_txnsHash.data;

            history?.push('/blockchain', {'txnData': txnsHash});
        }catch(error){
            console.log(error);
        }
  };
  

  return (
    <span>
      <Button onClick={() => buttonClicked()} negative size='tiny'>Delete Repo</Button>
    </span>
  );
};