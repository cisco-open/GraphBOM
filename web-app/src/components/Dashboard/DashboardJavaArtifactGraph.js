/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, {useState, useEffect} from 'react';
import { Graph } from 'react-d3-graph';
import  {myConfig} from '../GraphConfig';


const DashboardJavaArtifactGraph = ({params}) => {

    const [javaArtiGraphData, setGraphData] = useState([]);
    const [isLoaded, setLoaded] = useState(false);
    const [graphMsg, setGraphMsg] = useState('');

    useEffect(() => {
        let graphData = params.javaArti;
        if(graphData.nodes !== undefined){
            setGraphData(graphData);
            console.log(graphData)
            setLoaded(true);
            setGraphMsg();
        }
        else{
            setGraphMsg("No Graph Data ");
            setLoaded(false);
        }
    },[params]);



    return(
        <div>
            {isLoaded ? '': graphMsg}

            {isLoaded ? <Graph
                            id="my-graph-id"
                            data={javaArtiGraphData}
                            config={myConfig}
                        />: graphMsg
            }
        </div>
    )


}
export default DashboardJavaArtifactGraph;
