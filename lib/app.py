# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from python import callDependency as cd
from flask_mysql_connector import MySQL
from python import DatabaseConnection as dbc
import os
import json 
import time
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
import datetime
from subprocess import PIPE, Popen
import requests
import socket

app = Flask(__name__)
CORS(app, support_credentials=True)

token = os.getenv("ACCESS_TOKEN")
db_host = os.getenv("DB_HOST")
repo_db = os.getenv("DB_DATABASE")
db_user = os.getenv("DB_USER")
pass_word = os.getenv("DB_PASSWORD")


app.config['MYSQL_HOST'] = db_host
app.config['MYSQL_DATABASE'] = repo_db
app.config['MYSQL_USER'] = db_user
app.config['MYSQL_PASSWORD'] = pass_word

mysql_connect = MySQL(app)

# @app.route('/')
# async def hello():
#     return 'Hello, World!'

app.config['SECRET_KEY'] = os.getenv('RANDOM_KEY')

# users = {
#     "john": generate_password_hash("password"),
#     "jane": generate_password_hash("password")
# }
# @app.route('/login', methods=['POST'])
# def post():
#         auth = request.json
#         if not auth or not auth.username or not auth.password:
#             return jsonify({'message': 'Could not verify'}), 401
        
#         user = auth['username']
#         password = auth['password']
        
#         if user not in users or not check_password_hash(users.get(user), password):
#             return jsonify({'message': 'Could not verify'}), 401
        
#         token = jwt.encode({'user': user, 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)}, app.config['SECRET_KEY'])
        
#         return jsonify({'token': token.decode('UTF-8')})
    
# def login():
#     req = request.json
#     username = req['username']
#     password = req['password']
#     if username == 'myusername' and password == 'mypassword':
#         return jsonify({'success': True})
#     else:
#         return jsonify({'success': False})

def url_validation(repo_name):
    url = ''
    if 'https://github.com/' in repo_name['gitrepo'] and len(repo_name['gitrepo'].split('/', 5)) >= 5:
            if '.git' in repo_name['gitrepo']:
                url = repo_name['gitrepo'].replace(".git", "")
                url = "/".join(url.split('/',5)[3:5])
                return url
            else:
                url = repo_name['gitrepo']
                url = "/".join(url.split('/',5)[3:5])
                return url
    else:
        return None

def get_graph_details(url, repoObj):
        app.logger.info(f"Records fetching over Internet ...!" )

        result = cd.CallDependencyGraph(token, url, db_host, repo_db, db_user, pass_word, repoObj)
        if type(result) != tuple:
            return result
        elif len(result[1]) == 0:
            app.logger.info(f"edges are : {(result[1])}")
            return "Zero"
        else:
            nodes = result[0]
            edges = result[1]
            tG = result[2]
            params = result[3]
            return {"nodes": nodes, "edges":edges, "hash": tG, "params": params}

@app.route("/GetDependencyGraph", methods = ['POST'])
@cross_origin(supports_credentials=True)
def call_dependecny_graph():
    if request.method == "POST":
        repoObj = request.json
        url = url_validation(repoObj)
        if url:
            loggedin_user  = os.path.expanduser('~')
            # gitrepo_dir = loggedin_user+'/gitrepo/data'
            gitrepo_dir = os.getenv("FILE_PATH")+'/gitrepo/data'
            # gitrepo_dir = '/Users/saimamidi/Desktop/GraphPathChang/GraphBOM/gitrepo/data' 

            # Check git_repo dir exists 
            isGitrepos = os.path.exists(gitrepo_dir)

            if not isGitrepos:
                os.makedirs(gitrepo_dir, exist_ok=True)
                print(f"Default directory paths: {gitrepo_dir}")
            else:
                print(f"Default directory already exists: {gitrepo_dir}")

            git_uri = repoObj['gitrepo']
            repo_name = url.split('/')[-1]     
            cmd = f"rm -rf {gitrepo_dir}/{repo_name}"
            os.system(cmd)
            cmd = f"git -C {gitrepo_dir} clone {git_uri}"
            print("Cloning Git Repo")
            os.system(cmd)
            return get_graph_details(url, repoObj)
        else:
            return "None"


def get_Available_Repos(url):
    from python import get_available_repos as gar
    return gar.get_available_repos(url)

@app.route("/GetAvailableGraphs", methods = ['POST'])
@cross_origin(supports_credentials=True)
def get_availableRepos():
    if request.method == 'POST':
        repo_name = request.json
        app.logger.debug(f"Requested url ---> {repo_name}")
        
        if repo_name:
            app.logger.debug(repo_name)
            res =  get_Available_Repos(repo_name['gitrepo'])
            return res
        else:
            return "None"


def get_graph_based_hash(hashVal):
    from python import getHashGraph as ghg
    from python import DatabaseConnection as dbc
    query = """select reponame, nodes, edges from dependecny_graph where graph_hash = %s"""
    _, cur = dbc.getDatabaseConection()
    cur.execute(query, (hashVal,))
    record = cur.fetchone()
    cur.close()
    app.logger.debug(f"first recored ---> {record[0]}")
    url = (record[0])
    nodes = eval(record[1])
    edges = eval(record[2])
    new_edges = [i for i in edges if i['source']!= url]
    tG, sourceList, uList = ghg.gHMAC(nodes, new_edges)
    app.logger.debug(f"Orginal sourceList: --> {sourceList}")
    app.logger.debug(f"HASH Val: --->{tG}")
    for item in range(len(nodes)):
        if uList[item]['node'] == nodes[item]['id']:
                nodes[item]['hashVal'] = uList[item]['hashVal']

    return {"nodes": nodes, "edges":edges, "hash": tG}

@app.route("/GetGraphBasedOnHash", methods = ['POST'])
def get_graphBasedOnHash():
    if request.method == 'POST':
        hashVal = request.json['hash']
        app.logger.debug("Fetching from Database...!")
        return get_graph_based_hash(hashVal)


# get SBOM-tool fetched only the service call made.
def  get_sbom_vulnerabilities(url, sbom, graphhash):
    from python import getSBOM as gs
    return gs.getSBOM(url, sbom, graphhash)
@app.route("/GetSBOM", methods = ['POST'])
@cross_origin(supports_credentials=True)
def get_Scan_Sbom():
    if request.method == 'POST':
        repo_name = request.json
        app.logger.debug(f"Requested url ---> {repo_name}")
        if 'https://github.com/' in repo_name['gitrepo']:
            app.logger.debug(repo_name['gitrepo'])
            url = url_validation(repo_name)
            if url:
                print(f"Github URI ---> {repo_name}")
                res = get_sbom_vulnerabilities(repo_name['gitrepo'], repo_name['sbom'], repo_name['graphhash'])
                return res
        else:
            return "None"


def sign_signature(fileContents, formData):
    from python import SignByUser  as sby
    return sby.sign_with_privatekey(fileContents, formData)

@app.route("/uploadSign", methods=['POST'])
def upload_signValues():
    d = {}
    if request.method == 'POST':
        fileByteArray = request.files['file_from_react'].read()
        formItems = request.form
        res = sign_signature(fileByteArray, formItems)
        if isinstance(res, ValueError):
            d['error'] = str(res)
        else:
            d['status'] = res
    return jsonify(d)


def get_crypto_signature(reponame):
    from python import getCryptoSignatures as gcs
    return gcs.getCryptoDetector(reponame)


@app.route("/GetCryptoDetectors", methods=['POST'])
def get_crypto_detector():
    if request.method == 'POST':
        repo_name = request.json
        app.logger.debug(f"Requested url ---> {repo_name}")
        if 'https://github.com/' in repo_name['gitrepo']:
            app.logger.debug(repo_name['gitrepo'])
            url = url_validation(repo_name)
            if url:
                app.logger.debug(url)
                return get_crypto_signature(url)
        else:
            return "None"

def get_graph_hash(nodes, edges):
    from python import getHashGraph as ghg
    return ghg.gHMAC(nodes, edges)

@app.route("/GetGraphHash", methods=["POST"])
def get_graph_hash_():
    if request.method == "POST":
        nodes_edges = request.json
        nodes = nodes_edges['nodes']
        edges = nodes_edges['edges']
        new_edges = [i for i in edges if i['source']!= nodes_edges['repo']]

        app.logger.debug(f"Repo name : {nodes_edges['repo']}")

        if len(edges) > 0 and len(nodes):
            tg, sList, _ = get_graph_hash(nodes, new_edges)
            return ({'graphHMAC': tg, 'sourceList':sList})
        else:
            return "None"

# Blockchain APIs
def gethashdetails(reponame):
    from python import getBlockchainId as gbc
    return gbc.get_hash_object(reponame)

@app.route("/GetRepoDetailsForBlockChain", methods=["POST"])
def get_repo_details():
    if request.method == "POST":
        reponame = request.json['gitrepo']
        return gethashdetails(reponame)

def get_entire_blockchain(curl_url):
    from python import getBlockchainId as gbc
    return gbc.get_blockchain(curl_url)

@app.route("/getBlockChain", methods=["POST"])
async def get_all():
    curl_url = f"curl http://localhost:7000/get_all"

    app.logger.debug(f"Curl URL ==========> {curl_url}")

    try:
        getAll = get_entire_blockchain(curl_url)
        # app.logger.debug(f"Get All blockchain records ===> {getAll}")
        if len(getAll) == 0:
            return 'connection refused'
            
        output = json.loads(getAll)
        # app.logger.debug(f"GetAll blockchain repos ====> {output}")

        conn, curr = dbc.getDatabaseConection()

        repo_up_del = []
        for item in output:
            if item['isDeleted'] == 0:
                repo_up_del.append({'graph_hash':item['graph_hash'] ,'repo': item['repo_name'], 'del': item['isDeleted']})
        
        # app.logger.debug(f"filtered repo details...>{repo_up_del}")
        
        flag = 0

        # print(repo_up_del)
        if request.method == 'POST':
            res_obj = request.json['hashObj']
            app.logger.debug(f"Requested reponame===> {res_obj}")
            
            # Blockchain repo names
            for item in repo_up_del:
                # app.logger.debug(f"Repos avaialble in Blockchain ===> {item['repo']}")
                if item['repo'] == res_obj['repo_name'] and item['del'] == 0:
                    flag = 1
                    break
                
            if flag == 1:
                repo_name = res_obj['repo_name']    
                app.logger.debug("Updating ....!")
                res_obj = json.dumps(res_obj)
                curl_url = f"curl -X POST http://localhost:7000/update_repo -H accept:application/json -H Content-Type:application/json -d '{res_obj}'"
                res = get_entire_blockchain(curl_url).decode("utf-8").replace('"', '')
                res_ = f"https://goerli.etherscan.io/tx/{res}"

                try:
                    print(item['graph_hash'])
                    print(curl_url)
                    query = """UPDATE hash_dependency_graph
                                set blockchainTxnHash = %s
                                where graph_hash = %s"""
                    values = (res, item['graph_hash'])
                    curr.execute(query, values)
                    conn.commit()
                    flag = 0
                    return ([{'txnHash': res_, 'repo': repo_name}])
                except Exception as e:
                    flag = 0
                    return e
            else:
                # elif item['repo'] != res_obj['repo_name']:   
                repo_name = res_obj['repo_name']
                app.logger.debug("Adding repo name....!")
                res_obj = json.dumps(res_obj)
                curl_url = f"curl -X POST http://localhost:7000/add_repo -H accept:application/json -H Content-Type:application/json -d '{res_obj}'"
                
                add_repo = (get_entire_blockchain(curl_url))
                
                app.logger.debug(f"******* Txns HAHS ==> {str(add_repo)} ********")

                if not add_repo: 
                    res = add_repo.decode("utf-8").replace('"', '')
                    try:
                        query = """select reponame as repo, blockchainTxnHash as txnHash from hash_dependency_graph 
                            where reponame='{repo_name}'
                            order by created_at DESC"""
                        curr.execute(query)
                        result_set = curr.fetchall()
                        txnsObj = []
                        for item in result_set:
                            txnsObj.append({'repo': item[0], 'txnHash': f"https://goerli.etherscan.io/tx/{item[1]}" })
                        print(f"BlockChain Hashs===>{txnsObj}")
                        return txnsObj
                    except Exception as e:
                        return e
                else:
                    return add_repo.decode()
       
    except Exception as e:
        return str(e)

@app.route("/getAllBlockChainHash")
def get_all_txnsBlockchainHash():

    curl_get_all = f"curl http://localhost:7000/get_all"
    # print(f"Curl URL ==========> {curl_get_all}")
    get_all =  get_entire_blockchain(curl_get_all)

    if len(get_all) == 0:
        return 'connection refused'

    res_del_obj = json.loads(get_all)
    repo_up_del = []
    for item in res_del_obj:
        # print(item)
        if item['isDeleted'] == 0:
            repo_up_del.append(item['repo_name'])
    # print(repo_up_del)
    try:
        _, curr = dbc.getDatabaseConection()

        if len(repo_up_del) > 1:
                repo_up_del = tuple(repo_up_del)
                query = f"""SELECT reponame as repo, blockchainTxnHash as txnHash from hash_dependency_graph where reponame in {repo_up_del} and blockchainTxnHash != '' and blockchainTxnHash != '0'  and blockchainTxnHash != 'Internal Server Error' order by created_at DESC"""
                curr.execute(query)
        else:
            repo_up_del = ''.join(repo_up_del)
            print(f"********* In else part=====> {repo_up_del}***********")
            query = f"""SELECT reponame as repo, blockchainTxnHash as txnHash from hash_dependency_graph where reponame = '{repo_up_del}' and blockchainTxnHash != '' and blockchainTxnHash != '0' and blockchainTxnHash != 'Internal Server Error' order by created_at DESC"""
            curr.execute(query)

        result_set = curr.fetchall()
        
        txnsObj = []
        for item in result_set:
            txnsObj.append({'repo': item[0], 'txnHash': f"https://goerli.etherscan.io/tx/{item[1]}" })
        return txnsObj
    except Exception as e:
        return 0


@app.route("/deleteRepoinBlockChain", methods=["POST"])
async def get_available_BlockchainHash():
    try:
        if request.method == 'POST':
            repo_name = request.json['repo']
            crl_url = f"curl -X POST http://localhost:7000/delete_repo?repo_name={repo_name} -H accept:application/json -d ''"
            res = get_entire_blockchain(crl_url).decode("utf-8").replace('"', '')

            curl_get_all = f"curl http://localhost:7000/get_all"

            get_all =  get_entire_blockchain(curl_get_all)

            if get_all :
                res_del_obj = json.loads(get_all)
                app.logger.debug(f"Deleted repos=====>{res} ===> {res_del_obj}")

                deleted_repo = []
                for item in res_del_obj:
                    if item['isDeleted'] == 1:
                        deleted_repo.append(item['repo_name'])

                _, curr = dbc.getDatabaseConection()

                app.logger.debug(f"Deleted repos=====> {deleted_repo}")

                if len(deleted_repo) > 1:
                    deleted_repo = tuple(deleted_repo)
                    query = f"""select reponame as repo, blockchainTxnHash as txnHash from hash_dependency_graph 
                            where reponame not in {deleted_repo}
                            order by created_at DESC"""
                    curr.execute(query)
                else:
                    deleted_repo = ''.join(deleted_repo)
                    print(f"********* In else part=====> {deleted_repo}***********")
                    try:
                        query = f"""select reponame as repo, blockchainTxnHash as txnHash from hash_dependency_graph 
                                where reponame != '{deleted_repo}'
                                order by created_at DESC"""
                        curr.execute(query)
                    except Exception as e:
                        print(e)
                result_set = curr.fetchall()
                txnsObj = []
                for item in result_set:
                    txnsObj.append({'repo': item[0], 'txnHash': f"https://goerli.etherscan.io/tx/{item[1]}" })
                print(f"BlockChain Hashs===>{txnsObj}")
                return txnsObj
            else:
                return None
    except Exception as e:
        return 0



def call_graphBOM():
    from python import getGraphBOM as ggb
    res =  ggb.get_generate_GraphBOM()
    app.logger.debug(res)

    return res

@app.route("/getGraphBOM", methods=["GET"])
def get_graphBOM():
    # if request.method == 'POST':
    #     repo_obj = request.json

    res = call_graphBOM()
    res = res['graphBOM']['BOMs']
    bom_ = []
    for item in res:
        for bom in item['bom']:
            for dep in bom['dep-graph']:
                bom_.append({'bomtype':bom['bomtype'], 'source':dep['sourceInfo']})


    return bom_


def call_functionBOM(dir_path):
    from python import getFunctionBOM as gfb
    res =  gfb.getFunctionsBOM(dir_path)
    app.logger.debug(res)

    return res

@app.route("/getFunctionBOM", methods=["GET"])
def get_functionBOM():
    # if request.method == 'POST':
    #     repo_obj = request.json
    dir_path = "./python"
    return call_functionBOM(dir_path)

def call_graphBinary(tag):
    from python import getContainerScan as gbg
    return gbg.get_scanner_graph(tag)

@app.route("/GetContainerScanner", methods=['POST'])
def get_ContainerScan():
    tag = request.json['imageTag']
    print(f'<====={tag}=====>')
    res = call_graphBinary(tag)

    return res


def get_artifact_graph():
    from python import getJavaArtifactsGraph as gag
    return gag.get_artifacts_graph()

@app.route("/getJavaArtifactGraph", methods=["GET"])
def get_graph_():
    return get_artifact_graph()

def get_image_graph():
    from python import getBinaryImageGraph as gbi
    return gbi.get_binary_image_graph()

@app.route("/GetBinaryImageScanner", methods=["GET"])
def get_binary_image():
    return get_image_graph()

    # #### if rest API is Used enable the following the code #####
    # try: 
    #     # Server IP address
    #     server_address = "127.0.0.1" 
        
    #     # Default port 
    #     port = 6000
        
    #     # create a socket object
    #     sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    #     # set the socket timeout to 5 seconds
    #     sock.settimeout(5)

    #     # attempt to connect to the server
    #     result = sock.connect_ex((server_address, port))

    #     # if the connection is successful, return True
    #     if result == 0:
    #         url = f"http://{server_address}:6000/GetBinaryImageScanner"
    #         print(url)
    #         response = requests.get(url)
    #         if response.status_code == 200:
    #             response_json = json.loads(response.text)
    #             return response_json
    #     else:
    #         return "None"
    # except Exception as e:
    #     print(f"Exception during connection check: {str(e)}")
    #     return "None"


def get_repo_graph_details(url, repoObj):
        app.logger.info(f"Records fetching over Internet ...!" )
        from python import getRepoDependecnyGraph as grdg
        result = grdg.graphQlSetup(token, url, db_host, repo_db, db_user, pass_word, repoObj)
        if type(result) != tuple:
            return result
        elif len(result[1]) == 0:
            app.logger.info(f"edges are : {(result[1])}")
            return "Zero"
        else:
            nodes = result[0]
            edges = result[1]
            tG = result[2]
            params = result[3]
            return {"nodes": nodes, "edges":edges, "hash": tG, "params": params}

@app.route("/GetRepoDependencyGraph", methods = ['POST'])
@cross_origin(supports_credentials=True)
def call_repo_dependecny_graph():  
    if request.method == "POST":
        repoObj = request.json
        url = url_validation(repoObj)
        if url:
            loggedin_user  = os.path.expanduser('~')
            # gitrepo_dir = loggedin_user+'/gitrepo/data'
            # gitrepo_dir = '/Users/saimamidi/Desktop/GraphPathChang/GraphBOM/gitrepo/data'
            gitrepo_dir = os.getenv("FILE_PATH")+'/gitrepo/data'

            # Check git_repo dir exists 
            isGitrepos = os.path.exists(gitrepo_dir)

            if not isGitrepos:
                os.makedirs(gitrepo_dir, exist_ok=True)
                print(f"Default directory paths: {gitrepo_dir}")
            else:
                print(f"Default directory already exists: {gitrepo_dir}")

            git_uri = repoObj['gitrepo']
            repo_name = url.split('/')[-1]     
            cmd = f"rm -rf {gitrepo_dir}/{repo_name}"
            os.system(cmd)
            cmd = f"git -C {gitrepo_dir} clone {git_uri}"
            print("Cloning Git Repo")
            os.system(cmd)
            return get_repo_graph_details(url, repoObj)
        else:
            return "None"



# get SBOM-tool fetched only the service call made.
def  get_sbom_vulnerabilities(url, sbom, graphhash):
    from python import getSbomScanSbom as gss
    return gss.getSbom_Scan_Sbom(url, sbom, graphhash)
@app.route("/GetSbomScanSbom", methods = ['POST'])
@cross_origin(supports_credentials=True)
def getScan_Sbom():
    if request.method == 'POST':
        repo_name = request.json
        app.logger.debug(f"Requested url ---> {repo_name}")
        if 'https://github.com/' in repo_name['gitrepo']:
            app.logger.debug(repo_name['gitrepo'])
            url = url_validation(repo_name)
            if url:
                print(f"Github URI ---> {repo_name}")
                res = get_sbom_vulnerabilities(repo_name['gitrepo'], repo_name['sbom'], repo_name['graphhash'])
                return res
        else:
            return "None"

if __name__ == "__main__":
    app.run(debug=True)