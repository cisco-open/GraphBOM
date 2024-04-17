/**
MIT License

Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import '../../App.css';
import axios from 'axios';
import { Input, Button,  Label, Sidebar, Icon, Tab, Modal, Checkbox, Dimmer, Loader, Table, Image  } from 'semantic-ui-react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from '../ErrorBoundary';
import RateLimitVerticalMenu from '../RateLimitVerticalMenu';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import DashboardSBOM from './DashboardSBOM';
import DashboardVulnerabilities from './DashboardVulnerabilities';
import DashboardUploadSignatureForm from './DashboardUploadSignatureForm';
import DashboardEnableDecentralizedCapability from './DashboardEnableDecentralizedCapability';
import DashboardSign from './DashboardSign';
import DashboardCryptoDetector from './DashboardCryptoDetector';
import DashboardGraph from './DashboardGraph';
import LocalRepos from '../LocalRepos';
import jsPDF from 'jspdf';
import DashboardJavaArtifactGraph  from './DashboardJavaArtifactGraph';

// Rendering the Dashboard component 
const Dashboard = ({dashparam}) => {
  
    const [isLoading, setLoading] = useState(false);
    const [graphVals, SetGraph] = useState({});
    const [gitrepo, setGitRepo] = useState('');
    const [msg, setMsg] = useState('');
    const [repoName, setReponame] = useState('');
    const [isError, setError] = useState(false);
    const [btnState, setButState] = useState(true);
    const [graphQlParam, setGraphQlParam] = useState('');
    const [pullRequests, setPullReq] = useState();
    const [commitsMessages, setCommitMsgs] = useState();
    const [dependencies, setDependencies] = useState();
    // const [ratelimits, setRateLimts] = useState();
    const [visible, setSidebarVisible] = useState(false);
    const [rowDataLeft, setRowDataLeft] = useState([]);
    const [rowDataRight, setRowDataRight] = useState([]);
    const [rowDataSBOM, setRowDataSBOM]= useState([]);
    const [rowDataVul, setRowDataVul]= useState([]);
    //Model consts
    const [open, setOpen] = useState(false);
    const [openBlockChain, setOpenBlcokChain] = useState(false)
    const [openSignModel, setSignatureOpen] = useState(false)
    const [hashVal, setHashVal] = useState('');
    const [cryproDetector, setCryproDetectorRow] = useState([]);
    const [repoHashVals, setRepoHashVlas] = useState([]);

    const [activeTab, setActiveTab] = useState(0);

    const [statsRowData, setStatsRowData] = useState(0);
    const [statsVulData, setStatsVulData] = useState([]);

    const [javaArtifactGraph, setJavaArtiGraph] = useState([]);

    const host = process.env.REACT_APP_HOST_IP;
    const port = process.env.REACT_APP_HOST_PORT;

    // const location = useLocation();
    // const displyGraphBasedOnHash = async () => {
    //   debugger
    //   if (location.state !== undefined){
    //     let hash = location.state.data;
    //     try{
    //           const resp = await axios.post("http://"+`${host}`+":"+`${port}`+'/GetGraphBasedOnHash', {
    //             hash: hash
    //           });
    //           // setDataLoad(true);
    //           // setMsg("Graph Hash: " + resp.data.hash);
    //           setReponame(resp.data.nodes[0].id);
    //           SetGraph(resp.data);
    //           setActiveTab(0);
    //           SubmitUrl();
    //     }catch(error){
    //         console.log(error);
    //     }
    //   }
    // }

    // useEffect(() => {
    //   displyGraphBasedOnHash();
    // }, [location.state.data]);


    const validateUrl = (repoUrl) => {
      if (!repoUrl) return false;
      const match = repoUrl.match(
          /^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/
      );
      if (!match || !(match.groups?.owner && match.groups?.name)) return false;
      return match[0];
    }

    const SubmitUrl = async (e) => { 
      toast.warning("Fetching details..!");
      e.preventDefault();
      setLoading(true);
      if(graphQlParam.length >= 0 && validateUrl(gitrepo)){
        try{
            
          const response = await axios.post("http://"+host+":"+port+'/GetDependencyGraph', {
              gitrepo: validateUrl(gitrepo),
              // ratelimits: ratelimits,
              graphQlParam: graphQlParam,
              pullRequests: pullRequests,
              commitsMessages: commitsMessages,
              dependencies: dependencies
          }, 3000);

          if(typeof response.data !== "string"){
            const sbomRes = await axios.post("http://"+host+":"+port+'/GetSBOM', {
                gitrepo: validateUrl(gitrepo),
                sbom: 'sbom',
                graphhash: response.data.hash
            }, 3000);

            const VulRes = await axios.post("http://"+host+":"+port+'/GetSBOM', {
                gitrepo: validateUrl(gitrepo),
                sbom: 'scan',
                graphhash: ''
            }, 3000);

            const cryptoVals = await axios.post("http://"+host+":"+port+'/GetCryptoDetectors', {
                gitrepo: validateUrl(gitrepo)
            }, 3000);

            const blockChainID = await axios.post("http://"+host+":"+port+'/GetRepoDetailsForBlockChain', {
              gitrepo: validateUrl(gitrepo).split('/').splice(3,4).join('/').split('.').splice(0,1).join('')
            }, 3000);

            const javaArtifactRes = await axios.get("http://"+host+":"+port+'/getJavaArtifactGraph', {}, 3000);


          if(typeof response.data === "string"){
            if(response.data === 'None'){
              setError(true);
              setMsg("Invalid GitHub URL");
              setButState(true);
              setLoading(false);
            }
            else if(response.data === "Zero"){
              const gitstr = gitrepo.split("/", 5);
              const base_url = "https://github.com/";
              setMsg("It seems No manifest files found i.e no dependency Graph -> " `${base_url.concat(gitstr[3], "/", gitstr[4])}`);
              setError(true);
              setButState(true);
              setLoading(false);
            }
            else{
              setError(true);
              setButState(true);
              setMsg(response.data + " Check GraphQL API..!");
              setLoading(false);
            }
            setGitRepo('');
          }
          else{
            setButState(true);
            console.log(response.data.nodes);
            console.log(response.data.edges);
            setGitRepo('');
            setError(false);
            setReponame(response.data.nodes[0].id);
            setRowDataLeft(response.data.params);
            setHashVal(response.data.params[5].values)
            console.log(response.data.params);
            let second_grid = [
              {"action": "Enable Decentralized Capability", "id": "edc"},
              {"action": "Sign the Code/Supplychain Graph", "id": "sc"},
              {"action": "Upload Signature", "id": "us"},
              {"action": "Verify Signature", "id": "vs"},
              {"action": "Request for Signature Verification", "id": "rsv"},
            ]
            setRowDataRight(second_grid);
            setRowDataSBOM(sbomRes.data);
            setRowDataVul(VulRes.data);
            setCryproDetectorRow(cryptoVals.data);
            setRepoHashVlas(blockChainID.data);
            setJavaArtiGraph(javaArtifactRes.data);
            toast.success("Rendering the Graph..!");
            console.log(VulRes.data);
            console.log(cryptoVals.data);
            let graph_ = response.data;
            let valData = VulRes.data;
            for(let i=0; i<graph_.nodes.length; i++){
              for (let j=0; j<valData.length; j++){
                  if(graph_.nodes[i].pkg_name === valData[j].pack_name){
                    graph_.nodes[i]["cve_id"] = valData[j].cve_id
                    graph_.nodes[i]["source_url"] = valData[j].source_url
                    console.log(graph_.nodes[i]["cve_id"], graph_.nodes[i]["source_url"]);
                    break;
                  }else{ 
                    graph_.nodes[i]["cve_id"] = "No Vulnerability found"
                    graph_.nodes[i]["source_url"] = ""
                  }
              }
            }
            SetGraph(graph_);
            setLoading(false);
            debugger;
            let links = response.data.edges;
            let authors = {};
            links.forEach(function (item) {
              if(item.target.includes('/')){
                authors[item.target] = item.target ;
              }
            });
            setStatsRowData(Object.keys(authors).length);
            //Get vulnerabilities in % per each dependency package
            let vul = VulRes.data
            let vulStatsObj = {}
            if(vul !== "None"){
              vul.forEach(function (item) {
                if (vulStatsObj[item.pack_name]) {
                  vulStatsObj[item.pack_name] += 1;
                } else {
                  vulStatsObj[item.pack_name] = 1;
                }
              });
              let vv = []
              Object.entries(vulStatsObj).forEach(([key, value]) => {
                vv.push({'id': key,'cnt': value,'per': (value/vul.length*100).toFixed(2)+'%'});
              });
              console.log(vv);
              setStatsVulData(vv);
              setActiveTab(0);
            }
            
          }
        }else{
          setError(true);
          setMsg("Invalid GitHub URL/"+response.data);
          setButState(true);
          setLoading(false);
          setGitRepo('');
          SetGraph({});
        }

        }catch (error) {
          console.log(error);
          setMsg(error.message+' Check database/server connection..!');
          setError(true);
          setGitRepo('');
          setLoading(false);
        }
      }
      else{
        setSidebarVisible(true);
        setError(current => !current);
        setMsg("You must select GraphQL parameter, to avoid the GraphQL API error..!");
        setLoading(false);
      }
    }

    const handleChange = (e) => {
      if(e.target.value !== undefined){
          setGitRepo(e.target.value);
          setButState(false);
          setMsg("");
          setRowDataLeft([]);
          setRowDataRight([]);
          setStatsVulData([]);
        }
        else{
          setError(false);
          setButState(true);
          setSidebarVisible(false);
          setMsg("");
        }
    }

    const grapData = {
      nodes: graphVals.nodes,
      links: graphVals.edges,
    }

    const onRatelimit = (rateLimtArgs) => {
      setGraphQlParam(rateLimtArgs.graphQlParam);
      setPullReq (rateLimtArgs.pullRequests);
      setCommitMsgs (rateLimtArgs.commitsMessages);
      setDependencies (rateLimtArgs.dependencies);
      // setRateLimts (rateLimtArgs.ratelimits);
      if(rateLimtArgs.graphQlParam.length > 0){
        setMsg('');
      }
    }

    useEffect(()=>{
      if(dashparam)
        setOpenBlcokChain(dashparam.item);
    },[dashparam])

  const gridOptions1 = {
      enableCellTextSelection: true,
  }

  const gridOptions2 = {
    enableCellTextSelection: true,
  }


  // Left side Grid column defenisions
  const columnDefs1 = [
    {headerName: "Params", field:'params', width: 210},
    {headerName: "Values", field:'values', wrapText: true, autoHeight: true, width: 430}
  ];


  // Rendering the Sign form 
  const RenderSign = useMemo(() => {  
      return (<DashboardSign params={hashVal}/>);
  },[hashVal]);

  const chooseMessage = (openBlockChain) => {
    setOpenBlcokChain(openBlockChain);
  };

  // Rendering the Right side Grid in Dashboard
  const renderActions = (props) => {
    const id = props.valueFormatted ? props.valueFormatted : props.value;

    // Enable Decentralized Capability
    if(id === "edc"){

      
      // let sscsObj = {'hash': hashVal,'repo': repoName, 'nodes': graphVals.nodes, 'edges': graphVals.edges, 'graphql_param': graphQlParam, 'pullreq': pullRequests, 'commits': commitsMessages, 'manifests': dependencies, 'dependencies': dependencies }
      let repoObj = {'hashObj': repoHashVals, 'modelStatus': openBlockChain}
      return( 
               <Modal
               size='tiny'
               closeIcon
               dimmer='blurring'
               onClose={() => setOpenBlcokChain(false)}
               onOpen={() => setOpenBlcokChain(true)}
               open={openBlockChain}
               trigger={<Checkbox />}>
             <Modal.Header>Enable Decentralized Capability</Modal.Header>
             <Modal.Content>
               <Modal.Description>
                  <ErrorBoundary>
                   <DashboardEnableDecentralizedCapability params={repoObj} chooseMessage={chooseMessage} />
                  </ErrorBoundary>
               </Modal.Description>
             </Modal.Content>
             </Modal>
      );
    }

    //Sign the Code/Supplychain Graph
    if (id === "sc"){
      return(
        <Modal 
          size='small'
          closeIcon
          dimmer='blurring'
          onClose={()=>setSignatureOpen(false)}
          onOpen={()=>setSignatureOpen(true)}
          open={openSignModel}
          trigger={<Button primary size='tiny'>Sign the Code/Supplychain Graph</Button>}>
          <Modal.Header>Sign the Code/Supplychain Graph</Modal.Header>
            <Modal.Content>
              <Modal.Description>
                    {RenderSign}
              </Modal.Description>
            </Modal.Content>
          </Modal>
      )
    }

    // Upload Signature form
    if (id === "us"){
      return (  
              <Modal
              size='small'
              closeIcon
              dimmer='blurring'
              onClose={() => setOpen(false)}
              onOpen={() => setOpen(true)}
              open={open}
              trigger={<Button primary size='tiny'>Upload Signature</Button>}>
            <Modal.Header>Upload Signature</Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <ErrorBoundary>
                  <DashboardUploadSignatureForm />
                </ErrorBoundary>
              </Modal.Description>
            </Modal.Content>
            </Modal>
      );
    }

    // Verify Signature
    if (id === "vs"){
      return ( <Button primary size='tiny'>Verify Signature</Button> );
    }

    // Request for Signature Verification
    if (id === "rsv"){
      return ( <Button primary size='tiny'>Request for Signature Verification</Button> );
    }
    
  }
  
  // Right side Grid column definition
  const columnDefs2 = [
    {headerName: "Actions", field:'action', width: 300},
    {headerName: "", field:'id', cellRenderer: renderActions, width:330}
  ];

  // Default configurations of AG-Grid 
  const defaultColDef = useMemo(() => {
    return {
        resizable: true,
        filter: true,
        // flex: 1,
    };
  }, []);

  // Dashboard Grid styles
  const agGridStyle = {
      height: '450px', 
      width: '650px', 
      textAlign: 'left'
  }

  // Accessing the reponame to display in Tabs 
  const repo = repoName.split("/")[1];

  const renderGraph = useMemo(() => {
    let params = {'graphRow': grapData, 'repo': repo}
    return( <DashboardGraph params={params}/> );
  },[grapData]);

  const renderGraphSBOM = useMemo(() =>{
    let params = {'rowData': rowDataSBOM, 'repo': repo}
    return( <DashboardSBOM params={params} /> );
  },[rowDataSBOM]);

  const renderVul = useMemo(() =>{
    let params = {'rowData': rowDataVul, 'repo': repo}
    return(<DashboardVulnerabilities params={params}/>);
  },[rowDataVul]);

  const renderCryptos = useMemo(() => { 
    let params = {'rowData': cryproDetector, 'repo': repo}
    return (<DashboardCryptoDetector params={params}/>);
  },[cryproDetector]);

  const renderLocalRepo = useMemo(() => {
    let repoparam = {'repo': repoName}
    return (<LocalRepos params={repoparam}/>);
  }, [repoName]);

  const javaArtiGraph = {
      nodes: javaArtifactGraph.nodes,
      links: javaArtifactGraph.edges,
  }
  const renderArtifactsGraph = useMemo(() => {
    let repoparam = {'javaArti': javaArtiGraph}
    return (<DashboardJavaArtifactGraph params={repoparam}/>);
  }, [repoName]);

  const panes = [
    { menuItem: 'Graph', render: () => <Tab.Pane style={{height:'1000px'}}> { renderGraph } </Tab.Pane> },
    { menuItem: 'SBOM', render: () => <Tab.Pane style={{height:'1000px'}}>{ renderGraphSBOM } </Tab.Pane> },
    { menuItem: 'Vulnerabilities', render: () => <Tab.Pane style={{height:'1000px'}}>{ renderVul } </Tab.Pane> },
    { menuItem: 'Crypto Detector', render: () => <Tab.Pane style={{height:'1000px'}}>{ renderCryptos } </Tab.Pane> },
    { menuItem: 'History', render: () => <Tab.Pane style={{height:'1000px'}}>{ renderLocalRepo } </Tab.Pane> },
    { menuItem: 'Artifacts Graph', render: () => <Tab.Pane style={{height:'1000px'}}>{ renderArtifactsGraph } </Tab.Pane> },
  ]

  const renderStats = () =>{
      return (
        <div style={{marginTop:'3%',width:'70%', margin:'0 auto'}}  id="stats">
                <h5> DG-SSCS, Cisco Research, {repoName} and Details</h5>
                <Table celled>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Param</Table.HeaderCell>
                      <Table.HeaderCell>Value</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    <Table.Row>
                      <Table.Cell># of authors of the dependencies</Table.Cell>
                      <Table.Cell>{statsRowData}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>List of vulnerabilities in % per each dependency package</Table.Cell>
                      <Table.Cell>
                        <tr><td>Package Name</td><td>Count</td><td>Percentage</td></tr>
                        {
                          statsVulData.length > 0 ? statsVulData.map( item => (
                            <tr key={item.id}>
                              <td>{item.id}</td>
                              <td>{item.cnt}</td>
                              <td>{item.per}</td>
                            </tr> 
                          )) :'None'
                        }
                      </Table.Cell>
                    </Table.Row>
                    </Table.Body>
                  </Table>
              </div>
      );
  };

  const memorizeStats = useCallback(renderStats, [statsRowData, statsVulData, repoName]);

  function printDoc() {
    const pdf = new jsPDF('p', 'mm', [1080, 1920]);
    const data = document.querySelector("#stats");
    pdf.html(data, {
      callback: function (doc) {
        doc.save(repoName + "_stats");
      },
    });
  }

  return (
    <div>
        <div>
            {/* Configuration of Side Menu bar */}
            <Label as='a' color='teal' size="big" attached="top right"
                onClick={() => setSidebarVisible(true)}>
                <Icon name="align justify" as="i" />
                GraphQL Parameters
            </Label>
            <Sidebar className='App'
                    animation='overlay'
                    icon='labeled'
                    onHide={() => setSidebarVisible(false)}
                    visible={visible}
                    direction='right'
                    style={{top: '5%'}}
              >
              <ErrorBoundary>
                    <RateLimitVerticalMenu  onLoadRateLimt={onRatelimit}/>
              </ErrorBoundary>
            </Sidebar>
        </div> 

        <header className='App'>
            {/* <h1>Software Supply Chain Security - Dashboard</h1> */}
            <h1>GraphBOM: A platform for the Software Supply Chain Security</h1>
        </header>

    {/* Input form for GitHub url and toast message */}
      <div className='App'>
        <form onSubmit={SubmitUrl} method="post">
          <div className='input-url'>
            <label><b>GitHub</b> (url) &nbsp;&nbsp;</label>
                <Input focus type="text" 
                  required
                  placeholder="git repo url" 
                  value={gitrepo} 
                  name={gitrepo}
                  onChange={handleChange}
                  style = {{width: "300px"}}
                />&nbsp;&nbsp;
                {/* <Button content="Add" icon="plus circle"  labelPosition='right' /> */}
                
          </div>

          <Button primary size='big' disabled={btnState}> Submit </Button>
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
        </form>
        <p  id="msg" style={{padding:'2%'}} className={isError ? 'error' : 'success'}>{msg}</p>
      </div>


      <Dimmer active={isLoading}>
        <Loader active >Preparing Data</Loader>
      </Dimmer>

      {/* Rendering the two Ag-Grids */}
      <div className='left-rigt-ag-grid'>
            <div className="ag-theme-alpine" style={agGridStyle}>
                  <AgGridReact
                        columnDefs={columnDefs1}
                        rowData={rowDataLeft}
                        defaultColDef={defaultColDef}
                        gridOptions={gridOptions1}
                        >
                    </AgGridReact>
            </div>
            
            <div className="ag-theme-alpine" style={agGridStyle}>
                    <AgGridReact
                        columnDefs={columnDefs2}
                        rowData={rowDataRight}
                        defaultColDef={defaultColDef}
                        gridOptions={gridOptions2}
                        >
                    </AgGridReact>
            </div>
      </div>

          <Tab panes={panes} defaultActiveIndex={activeTab} style={{width:'90%', margin:'0 auto', paddingTop: '2%'}}/>
          
          
          <div className='App'>
          {
            statsRowData > 0 ? 
              (<div>
                <Button primary onClick={printDoc} >Generate Pdf</Button>
                {memorizeStats}
              </div>
              )
              : ''
          }
          </div>
    </div>
  );
}

export default Dashboard;
