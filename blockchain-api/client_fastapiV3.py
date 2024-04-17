# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


from fastapi import FastAPI
import json
import pydantic
import os
from web3 import Web3, HTTPProvider
from web3.middleware import geth_poa_middleware
from pydantic import BaseModel
import mysql.connector as connector
from dotenv import load_dotenv

load_dotenv()

try:
    mydb = connector.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_DATABASE"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
except Exception as e:
    print("Database is not running...!")

address = os.getenv("WALLET_ADDRESS") # Your wallet address
priv_key = os.getenv("WALLET_PRIVATE_KEY") #private key of your wallet. Do not use on mainnet, use environment variables.
contract_address = os.getenv("CONTRACT_ADDRESS") # address of the imported contract.
abi_raw = open('./abi.json') #change to the path of the abi.json. Note: you can obtain abi from your compiler (ex. remix.ethereu.org or truffle) or blockchain explorers
abi = json.load(abi_raw) # open the abi.json file

web_api_add = os.getenv("WEB3_API_KEY")
#Goerli is an Ethereum testnet for developers to test smart contracts and decentralized applications without using real cryptocurrency on the main network.
w3 = Web3(HTTPProvider(f"https://goerli.infura.io/v3/{web_api_add}")) # this is our node provider. This code contains the api key of the free account.
contract = w3.eth.contract(address=contract_address, abi=abi)
nonce = w3.eth.get_transaction_count(address) # nonce of your address

app = FastAPI()

class Item(BaseModel):
    graph_hash:str
    repo_name:str
    graphql_param:str
    pullreq:int
    commits:int
    manifests:int
    releases:str
    languages:str
    forks:str
    pullreq_commits:str
    created_at:str
    sbom:str

@app.post("/add_repo")
async def add_new(item:Item):
    nonce = w3.eth.get_transaction_count(address) # nonce of your address
    transaction = contract.functions.addProject(item.graph_hash,item.repo_name,item.graphql_param,item.pullreq,item.commits,item.manifests,item.releases,item.languages,item.forks,item.pullreq_commits, item.created_at, item.sbom).buildTransaction({'chainId': 5, 'gas':1975000, 'nonce': nonce})
    signed_transaction = w3.eth.account.signTransaction(transaction, priv_key)
    # print(signed_transaction)
    
    #When you finish the signing process, you can send the signed transaction to the network with our infura interface.
    tx_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
    res = str(Web3.toHex(tx_hash))    
    get_receipt = w3.eth.wait_for_transaction_receipt(res, timeout=60, poll_latency=0.1)

    # Check the status of transaction 
    if get_receipt['status'] == 0:
        print(f"Status===> {get_receipt['status']}")
        return 0 #'Fail with error project already exists'
    else:
        try:
            query = """UPDATE hash_dependency_graph
                        set blockchainTxnHash = %s
                        where graph_hash = %s"""
            values = (res, item.graph_hash)
            cur = mydb.cursor()
            cur.execute(query, values)
            mydb.commit()
            print(Web3.toHex(tx_hash))
            return str(Web3.toHex(tx_hash)) 
        except Exception as e:
            return e
#http://127.0.0.1:8000/add_repo/?graph_hash=asdasd&repo_name=Ege15&graphql_param=adasdasd&pullreq=2&commits=3&releases=4&languages=Python&forks=6&pullreq_commits=7&created_at=10


@app.post("/update_repo")
async def update_repo(item:Item):
    try:    
        nonce = w3.eth.get_transaction_count(address) # nonce of your address
        transaction = contract.functions.updateProject(item.graph_hash,item.repo_name,item.graphql_param,item.pullreq,item.commits,item.manifests,item.releases,item.languages,item.forks,item.pullreq_commits,item.created_at, item.sbom).buildTransaction({'chainId': 5, 'gas':1970000, 'nonce': nonce})
        signed_transaction = w3.eth.account.signTransaction(transaction, priv_key)
        #When you finish the signing process, you can send the signed transaction to the network with our infura interface.
        tx_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
        #return tx_hash
        return str(Web3.toHex(tx_hash)) 
    except Exception as e:
        return 0
#http://127.0.0.1:8000/update_repo/?graph_hash=maskmask&repo_name=Ege15&graphql_param=adasdasd&pullreq=2&commits=3&releases=4&languages=Python&forks=6&pullreq_commits=7

@app.get("/get_all")
async def get_all():
    try:
        x = contract.functions.getAllProjects().call()
        #return ('Total number of the records is',len(x))
        entireBlockChain=[]
        keys = ['graph_hash', 'repo_name', 'graphql_param', 'pullreq', 'commits', 'manifests', 'releases', 'languages', 'forks', 'pullreq_commits','created_at', 'sbom', 'isValue', 'isDeleted']
        for item in x:
            temp_obj = {}
            if item[13] == 0:
                for idx in range(len(keys)):
                    temp_obj[keys[idx]] = item[idx]
            if temp_obj:
                entireBlockChain.append(temp_obj)
        return entireBlockChain
    except Exception as e:
        return 0
#http://127.0.0.1:8000/get_all

@app.get("/get_one")
async def get_one(repo_name: str):
    try:
        x = contract.functions.getProject(repo_name).call()
        return x
    except Exception as e:
        return 0
#http://127.0.0.1:8000/get_one/?repo_name=Ege1

'''
@app.get("/add_repo/")
async def add_new(graph_hash:str, repo_name:str, graphql_param:str, pullreq:int, commits:int, releases:int, languages:str, forks:int, pullreq_commits:int, created_at:int):
    nonce = w3.eth.get_transaction_count(address) # nonce of your address
    transaction = contract.functions.addProject(graph_hash,repo_name,graphql_param,pullreq,commits,releases,languages,forks,pullreq_commits,created_at).buildTransaction({'chainId': 5, 'gas':970000, 'nonce': nonce})
    signed_transaction = w3.eth.account.signTransaction(transaction, priv_key)
    #When you finish the signing process, you can send the signed transaction to the network with our infura interface.
    tx_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
    #return tx_hash
    return str(tx_hash)   
#http://127.0.0.1:8000/add_repo/?graph_hash=asdasd&repo_name=Ege15&graphql_param=adasdasd&pullreq=2&commits=3&releases=4&languages=Python&forks=6&pullreq_commits=7&created_at=10

@app.get("/update_repo/")
async def add_new(graph_hash:str, repo_name:str, graphql_param:str, pullreq:int, commits:int, releases:int, languages:str, forks:int, pullreq_commits:int):
    nonce = w3.eth.get_transaction_count(address) # nonce of your address
    transaction = contract.functions.updateProject(graph_hash,repo_name,graphql_param,pullreq,commits,releases,languages,forks,pullreq_commits).buildTransaction({'chainId': 5, 'gas':970000, 'nonce': nonce})
    signed_transaction = w3.eth.account.signTransaction(transaction, priv_key)
    #When you finish the signing process, you can send the signed transaction to the network with our infura interface.
    tx_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
    #return tx_hash
    return str(tx_hash)
#http://127.0.0.1:8000/update_repo/?graph_hash=maskmask&repo_name=Ege15&graphql_param=adasdasd&pullreq=2&commits=3&releases=4&languages=Python&forks=6&pullreq_commits=7
'''
@app.post("/delete_repo")
async def delete_repo(repo_name: str):
    try:
        nonce = w3.eth.get_transaction_count(address) # nonce of your address
        transaction = contract.functions.deleteProject(repo_name).buildTransaction({'chainId': 5, 'gas':1970000, 'nonce': nonce})
        signed_transaction = w3.eth.account.signTransaction(transaction, priv_key)
        #When you finish the signing process, you can send the signed transaction to the network with our infura interface.
        tx_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
        #return tx_hash
        print(str(Web3.toHex(tx_hash)))
        return str(Web3.toHex(tx_hash))
    except Exception as e:
        return 0
#http://127.0.0.1:8000/delete_repo/?repo_name=Ege1