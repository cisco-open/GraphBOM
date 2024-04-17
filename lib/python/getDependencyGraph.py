# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import requests
import mysql.connector as connector
from mysql.connector import Error
import json
import logging
from python import getHashGraph as ghg
# import getHashGraph as ghg
from github import Github
import base64
import sys
import hashlib
import datetime


class GraphQlAPI:
    def __init__(self, token: str, endpoint: str = "https://api.github.com/graphql"):
        self.endpoint = endpoint
        self.session = requests.Session()
        authentication_header = {"Authorization": f"bearer {token}"}
        preview_header = {"Accept": "application/vnd.github.hawkgirl-preview+json"}
        self.session.headers.update({**authentication_header, **preview_header})

    def run_query(self, query: str):
        """Make a generic GraphQL query"""
        response = self.session.post(self.endpoint, json={"query": query})
        return response.json()

class FetchDependencyGraph:
    def __init__(self, graphapiUrl: GraphQlAPI, token, repo_name):
        self.api_query = graphapiUrl
        self.token = token
        self.repo_name = repo_name

    def get_dependencies(self, repo: str, repo_params): 
        owner, name = repo.split("/",1)
        graphQlParam = repo_params['graphQlParam']
        pr = repo_params['pullRequests']
        commits = repo_params['commitsMessages']
        depedencies = repo_params['dependencies']
        query = f"""{{ repository( owner: \"{owner}\", name: \"{name}\")
            {{
                licenseInfo {{
                    name
                    url
                    spdxId
                    description
                }}
                
                pullRequests({graphQlParam}: {pr}) {{
                    edges {{
                        node {{
                            commits({graphQlParam}: {commits}) {{
                                edges {{
                                        node {{
                                            commit {{
                                                oid
                                                message
                                            }}
                                        }}
                                }}
                            }}
                            url
                            author {{
                                login
                                url
                            }}
                        }}
                    }}

                }}
                dependencyGraphManifests
                {{
                    nodes
                    {{
                        blobPath
                        dependencies ({graphQlParam}: {depedencies})
                        {{
                            nodes
                            {{
                                packageName
                                requirements
                                hasDependencies
                                repository
                                {{
                                    nameWithOwner
                                }}
                                packageManager
                            }}
                        }}
                    }}
                }}
            }}
        }}"""
        return self.api_query.run_query(query)

    def get_metadata(self):
        # Creating a Github ojbect with token
        gitObj = Github(self.token)

        # Get the repo metadata from the given repo
        repo_obj = gitObj.get_repo(self.repo_name)

        # Get License information of the repo
        lics = base64.b64decode( repo_obj.get_license().content.encode() ).decode()
        rootLicense = (lics.splitlines()[:3])
        lice = []
        for item in rootLicense:
            lice.append(item.strip())
        lice_info = [{'license': lice}]

        # Get All the releases of the repo
        rel_info = []
        releases = repo_obj.get_releases()
        for rel in releases:
            rel_info.append(rel.title)
        releases = [{'releases': rel_info}]

        # Get number of languages of the repo
        languages = [lang for lang in repo_obj.get_languages()]
        languages = [{'languages': languages}]

        # Get the number of authors fokred the repo
        forks = repo_obj.get_forks()
        fork_list = []
        for fork in forks:
            fork_list.append(fork.full_name)
        forks = [{'forks': fork_list }]

        # Get latest commit author and datatime
        repo_commits = repo_obj.get_commits()
        commit = repo_obj.get_commit(repo_commits[0].sha)
        commit_author = commit.commit.author.name
        commit_timestam = commit.commit.author.date

        return lice_info, releases, languages, forks, commit_author, commit_timestam 

    def dependency_graph(self, repo: str, host:str, db:str, user:str, pass_wd:str, repo_params):
        query_result = self.get_dependencies(repo, repo_params)
        
        # print(f"<======Dependency Graph===={query_result}=======>")
        
        if query_result.get("errors"):
            error_msg = query_result.get("errors")[0]['message']
            return error_msg

        elif 'data' in query_result and len(query_result['data']['repository']['dependencyGraphManifests']['nodes']) == 0:
            return "No Dependency Grpah Found..!"
        elif 'data' in query_result:
            # get license information, releases, langiages, fokrs of the repo
            license_info, releases, languages, forks, commit_author, commit_timestam  = self.get_metadata()
            
            # Feteching author, commit messages and sha value
            author_details = dict()
            pullreqs = query_result["data"]["repository"]['pullRequests']['edges']

            for pr in pullreqs:
                # print(f"Pull requests=====> {pr}=====>")
                commits = pr['node']['commits']['edges']
                for commit in commits:
                    if pr['node']['author'] == None:
                        continue
                    if pr['node']['author']['url'] in author_details:
                        author_details[pr['node']['author']['url']].append({'pullreq_url': pr['node']['url'], 'sha': commit['node']['commit']['oid'],
                                    'commit_message': commit['node']['commit']['message']})
                    else:
                        author_details[pr['node']['author']['url']] = [{'pullreq_url': pr['node']['url'], 'sha': commit['node']['commit']['oid'],
                                    'commit_message': commit['node']['commit']['message']}]
                
            # Parsing dependecny grph parameters        
            dependency_files = query_result["data"]["repository"]["dependencyGraphManifests"]
            
            # graphList = []
            nodes = [{
                'id': repo, 'size': 1500, 'author': 'https://github.com/'+repo,  
                'forks': forks, 'languages': languages, 'releases':releases, 'license_info': license_info, 'author_details': author_details 
            }]

            edges = []
            for file in dependency_files["nodes"]:
                root_packages = (file["blobPath"].split("/")[-1])
                print(file)
                # if 'package-lock.json' in root_packages or 'go.sum' in root_packages:
                #     continue;

                # print(file["blobPath"])
                # graphList.append((repo, root_packages))
                nodes.append({'id': root_packages, 'size': 800, 'author': 'https://github.com/'+file["blobPath"],  })

                for dependency in file["dependencies"]["nodes"]:
                    
                    try:
                        dependency_name = dependency["repository"]["nameWithOwner"]
                    # Sometimes dependency repositories don't exist.
                    except TypeError:
                        dependency_name = dependency["packageName"]

                    if dependency["hasDependencies"]:
                        edges.append({'source': root_packages, 'target': dependency_name})
                        nodes.append({'id': dependency_name, 'author': 'https://github.com/' + dependency_name.split('/', 2)[0], 'pkg_name':dependency["packageName"] })
                edges.append({'source': repo, 'target': root_packages })

        
            # connecting databases
            mydb = connector.connect(
                host=host,
                database=db,
                user=user,
                password=pass_wd
            )
            try:
                if mydb.is_connected():
                    # creating database cursor
                    cur = mydb.cursor()
                    
                    new_edges = [i for i in edges if i['source']!= repo]

                    # finding the graph hash from the dependency graph 
                    tG, sourceList, uList = ghg.gHMAC(nodes, new_edges)
                    # print(sourceList)
                    # print(tG)
                    
                    # Inserting hashed graph objects to hash depenedency graph table
                    query = "select graph_hash from hash_dependency_graph where graph_hash = %s and reponame = %s"
                    cur.execute(query, (tG, repo))
                    _record = cur.fetchone()
                    print(f"REPO in DB====> {_record}")
                    if _record == None or _record[0] != tG :
                        print("<====INSERTING INTO DATABASE===>")
                        ratelimits = (int(repo_params['pullRequests']) * int(repo_params['commitsMessages'])) +  (int(repo_params['dependencies']) * int(repo_params['dependencies']))
                        
                        # Insert updated entries of the repo graph_has is the primary key 
                        insert_query = """INSERT INTO dependecny_graph (graph_hash, reponame, graphql_param, pullreq, commits, manifests, dependencies, rate_limit,  nodes, edges, license_info, releases, languages, forks, pullreq_commits) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                        values = (str(tG), str(repo), str(repo_params['graphQlParam']), int(repo_params['pullRequests']), int(repo_params['commitsMessages']), int(repo_params['dependencies']), int(repo_params['dependencies']), ratelimits, json.dumps(nodes), json.dumps(edges), json.dumps(license_info), json.dumps(releases), json.dumps(languages), json.dumps(forks), json.dumps(author_details))
                        
                        # cur.execute(insert_query, values)
                        
                        # compute hash of nodes, edges, license_info, releases, languages, forks, pullreq_commits
                        hash_nodes = hashlib.sha256(json.dumps(nodes).encode()).hexdigest()
                        hash_edges = hashlib.sha256(json.dumps(edges).encode()).hexdigest()
                        hash_lice = hashlib.sha256(json.dumps(license_info).encode()).hexdigest()
                        hash_releases = hashlib.sha256(json.dumps(releases).encode()).hexdigest()
                        hash_langs = hashlib.sha256(json.dumps(languages).encode()).hexdigest()
                        hash_forks = hashlib.sha256(json.dumps(forks).encode()).hexdigest()
                        hash_pullreq = hashlib.sha256(json.dumps(author_details).encode()).hexdigest()

                        curr_timestam = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

                        hash_insert_query = """INSERT INTO hash_dependency_graph (
                                graph_hash,reponame,graphql_param,pullreq,commits,manifests,dependencies,rate_limit,nodes,edges,license_info,releases,languages,forks,pullreq_commits,created_at, blockchainTxnHash, isDeleted, sbom
                            ) values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                        hash_values = (
                            str(tG), str(repo), str(repo_params['graphQlParam']), int(repo_params['pullRequests']), int(repo_params['commitsMessages']), int(repo_params['dependencies']), int(repo_params['dependencies']), ratelimits, str(hash_nodes), str(hash_edges), str(hash_lice), str(hash_releases), str(hash_langs), str(hash_forks), str(hash_pullreq), curr_timestam, '', 0, '' 
                        )
                        
                        cur.execute(hash_insert_query, hash_values)

                        mydb.commit()
                        logging.debug("Insertion successfull...!")

                    # Inserting into database with actual JSON values into Dependecny Graph Table
                    query = "select graph_hash from dependecny_graph where graph_hash = %s and reponame = %s"
                    cur.execute(query, (tG, repo))
                    record = cur.fetchone()
                    if record == None or record[0] != tG :
                        print("<====INSERTING INTO DATABASE===>")
                        ratelimits = (int(repo_params['pullRequests']) * int(repo_params['commitsMessages'])) +  (int(repo_params['dependencies']) * int(repo_params['dependencies']))
                        
                        # Insert updated entries of the repo graph_has is the primary key 
                        insert_query = """INSERT INTO dependecny_graph (graph_hash, reponame, graphql_param, pullreq, commits, manifests, dependencies, rate_limit,  nodes, edges, license_info, releases, languages, forks, pullreq_commits) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                        values = (str(tG), str(repo), str(repo_params['graphQlParam']), int(repo_params['pullRequests']), int(repo_params['commitsMessages']), int(repo_params['dependencies']), int(repo_params['dependencies']), ratelimits, json.dumps(nodes), json.dumps(edges), json.dumps(license_info), json.dumps(releases), json.dumps(languages), json.dumps(forks), json.dumps(author_details))
                        
                        cur.execute(insert_query, values)
                        
                        mydb.commit()
                        logging.debug("Insertion successfull...!")
                    
                    
                    valid = ghg.gVrfy(nodes, edges, tG, sourceList, uList)
                    print(f"Verification --> {valid}")

                    
                    for item in range(len(nodes)):
                        if uList[item]['node'] == nodes[item]['id']:
                            nodes[item]['hashVal'] = uList[item]['hashVal']

                    params = [  
                                {"params": "Repo name", "values": repo},
                                {"params": "Repo URL", "values": 'https://github.com/'+repo},  
                                {"params": "Last commit time/date", "values": [f"Author: {commit_author}", f"Last Commit: {commit_timestam}"]},
                                {"params": "Config paramaters", "values": [f"Graph Param: {repo_params['graphQlParam']}", f"Pull Requests: {repo_params['pullRequests']}"] },
                                {"params": "Supply chain graph", "values": [f"# nodes:{len(nodes)}", f"# edges:{ len(edges)}", f"# of Dependencies: {repo_params['dependencies']}", f"# of commits: {repo_params['commitsMessages']}"] }, 
                                {"params":'Supply Chain Graph Hash',"values": tG}
                            ]

                    return nodes, edges, tG, params
            except TypeError as e:
                logging.error("Error while connecting to MySQL", e)

            finally:
                logging.debug('The try except is finished')
                mydb.close()
        elif query_result["message"]:
                err = query_result['message']
                return err

def graphQlSetup(token, repo_name, host, repo_db, user, passwd, repo_params):
    api = GraphQlAPI(token=token)
    dependencies = FetchDependencyGraph(api, token, repo_name)

    return dependencies.dependency_graph(repo_name, host, repo_db, user, passwd, repo_params)
