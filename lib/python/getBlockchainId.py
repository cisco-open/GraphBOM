# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


"""
This microservice gets the blockchain hash id from the Blockchain-Solidity
"""
from subprocess import PIPE, Popen, CalledProcessError
import json
from python import DatabaseConnection as dbc

def get_blockchain(url_bc):
    print(f"URL for BC ===> {url_bc}")
    
    capture_cmd_result = Popen(url_bc, stdout=PIPE, shell=True)
    output, stderr = ((capture_cmd_result.communicate()))
    if output != "None":
        return (output)
    elif output == 'None':
        return (stderr)
"""
{
    'graph_hash'
    'repo_name'
    'graphql_param'
    'pullreq'
    'commits'
    'manifests'
    'releases'
    'languages'
    'forks'
    'pullreq_commits'
    'created_at'
    'sbom'
}
"""

def get_hash_object(reponame):
    print(f"Hashed repo name{reponame}")
    _, curr = dbc.getDatabaseConection()
    query = f"""select graph_hash, reponame, graphql_param, pullreq, commits, manifests, releases, languages, forks, pullreq_commits, created_at, sbom 
                from hash_dependency_graph where reponame='{reponame}' ORDER  by  created_at desc limit 1;""";
    curr.execute(query)
    res1 = curr.fetchall()[0]
    res = [val for val in res1]
    hash_obj={}
    print(f"Hashes ====> {res1}")
    if res:
        hash_obj['graph_hash'] = res[0]
        hash_obj['repo_name'] = res[1]
        hash_obj['graphql_param'] = res[2]
        hash_obj['pullreq'] = res[3]
        hash_obj['commits'] = res[4]
        hash_obj['manifests'] = res[5]
        hash_obj['releases'] = res[6]
        hash_obj['languages'] = res[7]
        hash_obj['forks'] = res[8]
        hash_obj['pullreq_commits'] = res[9]
        hash_obj['created_at'] = res[10].strftime('%Y-%m-%d %H:%M:%S')
        hash_obj['sbom'] = res[11]

        return hash_obj

