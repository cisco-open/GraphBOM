/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React from 'react';
import '../custom.css';
import {  Icon } from 'semantic-ui-react'


function GenerateCustomNode({node}) {
    return (
        <div className="person-node-label">
             {/* <label>{node.id} </label><br />
             <a href={node.author} target="_blank" rel="noopener noreferrer">Author Profile </a> <br /> */}
             {/* Latest Release: {node.releases[0].name} <br />
             <a href={node.releases[0].url} target="_blank" rel="noopener noreferrer">Latest Release Url</a> <br />
             <label>Node Hash: {node.hashVal}</label> <br />
             <label>license: {node.license_info[0].name}</label> <br /> */}
             <div className="node-tooltip">
                <div className="tooltip-arrow" />
                <div className="node-label"><Icon name='circle outline' /></div>
            </div>
        </div>

    );
}

export default GenerateCustomNode;