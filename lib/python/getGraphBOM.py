# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


from github import Github
import base64
import os
import hashlib
import datetime
import json
from python import getSbomScanSbom as gsb
from python import SignByUser as sbu
from python import getCryptoSignatures as gcs
from python import getFunctionBOM as gfb


SRCDIR = os.path.dirname(os.path.abspath(__file__))
rsa_key_filename = os.path.join(SRCDIR, 'rsakey.pem')
print(rsa_key_filename)


def get_generate_GraphBOM():
    assetname = "AJgxGxMokCt5izepRrn49diwGdPwuGNnQQUvQw9RmMQBNwdyk49hh53GmDWyeggG"
    assettype_param = "software"
    assetreponame = "evmos/evmos"
    assetrepourl = "https://github.com/evmos/evmos"
    standard = "sbom" # sbom/cycloneDX/tr/hbom
    bomtype = "packagebom" #packagebom/cryptographybom/apibom/license
    # Get loggedin user name with path from the root

    gitrepo_dir = os.getenv("FILE_PATH")+'/gitrepo/data'
    repo_dir = assetreponame.split('/')[-1]

    # Public key certificate 
    with open(rsa_key_filename) as f:
        contents = f.read()

    cipher_suite = {"hashValue": "", "algo":"RSA"}

    token = os.getenv("ACCESS_TOKEN")

    def Asset_Type(param):
        if param == "software":
            return "software"
        elif param == "hardware":
            return "hardware"
        elif param == "firmware":
            return "firmware"
        elif param == "cyberphysical":
            return "cyberphysical"

    def get_gitrepo_Obj(repo_name):

        # Connect github using token 
        gitObj = Github(token)

        # Get the repo metadata from the given repo
        repo_obj = gitObj.get_repo(repo_name)

        return repo_obj

    def Asset_Identity(asset_name, repo, repo_url):
        ass_id = []

        id = asset_name+repo+repo_url
        id_hash = hashlib.sha1(id.encode("utf-8")).hexdigest()

        repo_obj = get_gitrepo_Obj(repo)

        # get owner of the repo
        owner  = repo_obj.full_name.split("/")[0]
        time_created = repo_obj.created_at.strftime("%Y-%m-%d %H:%M:%S")

        time_last_update = repo_obj.last_modified

        # last updater
        repo_commits = repo_obj.get_commits()
        commit = repo_obj.get_commit(repo_commits[0].sha)
        last_updater = commit.commit.author.name

        # version
        releases = repo_obj.get_releases()
        current_version = ""
        for rel in releases:
            current_version = rel.title
            break

        ass_id.append({
            "id": id_hash, 
            "Metainfo": {
                "owner":owner, 
                "time_created": time_created,
                "time_last_updated": time_last_update,
                "last_updater": last_updater, 
                "current_version": current_version
            }
        })
        return ass_id

    def Provenance_Def(repo_name):
        repo_obj = get_gitrepo_Obj(repo_name)

        # get owner of the repo
        who  = repo_obj.full_name.split("/")[0]
        when = repo_obj.created_at.strftime("%Y-%m-%d %H:%M:%S")
        
        # version
        releases = repo_obj.get_releases()
        versions = []
        if len(releases.get_page(1)) > 0:
            for rel in releases:
                versions.append(rel.title)
            current_version = versions[0]
            first_version  = versions[-1]
        else:
            current_version = "no version"
            first_version  = "no version"

        prov=[]
        prov.append({
            "who": who,
            "when": when,
            "where": "",
            "what": "",
            "how": "",
            "current-version": current_version,
            "from-version": first_version,
        })
        return prov

    def vulnerabilities(repo_url):
        vel_vector = [] 
        
        res = gsb.getSbom_Scan_Sbom(repo_url, "scan", "")

        if res != "None":
            for item in res:
                vul_obj = {
                    "packagae_name": item["pack_name"],
                    "id": item["cve_id"],
                    "what": "vulnerability", 
                    "who": item["source_url"],
                    "where": item["location"],
                    "when": "",
                    "how-identified": item["source_url"],
                    "how-exploited": item["description"],
                    "threats": "",
                    "validation": "",
                    "severity": item["severity"]
                }

                # for every object the Hash is created
                vel_vector.append({
                    hashlib.sha256(json.dumps(vul_obj).encode()).hexdigest():vul_obj
                })
            
        return vel_vector


    def get_trust(repo_url, _standard, _bom_Type):
        trust = []

        if _standard == "sbom" or _standard == "cycloneDX" and _bom_Type != "":
            # Sign object
            sig_obj = {
                    "public-key-cert": "",
                    "cipher-suite": cipher_suite["algo"],
                    "signature": sbu.sign_with_privatekey(contents, cipher_suite),
                    "timestamp-of-signing": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                    "what-is-signed": "",
                    "assetid": "",
                    "hash-signed": ""
            }

            trust.append({
                "integrityAssurance": {
                    "hash": "",
                    "hash_type": "",
                    "hash_function":"",
                    "hasSignature": "",
                    #  for every signature hash is created
                    "signature": {
                        hashlib.sha256(json.dumps(sig_obj).encode()).hexdigest():sig_obj
                    },
                    "securityRisk":{
                        "riskType": "",
                        "riskVector": "",
                        "riskScore":"",
                        "source":{}
                    },
                    "vulnerabilities":vulnerabilities(repo_url=repo_url),
                    "patches": {
                        "vulnerabilities_id": "",
                        "patch_id":"",
                        "timestamp":""
                    }
                }

            })
        else:
            # Sign Object 
            sig_obj = {
                    "public-key-cert": "",
                    "cipher-suite": cipher_suite["algo"],
                    "signature": sbu.sign_with_privatekey(contents, cipher_suite),
                    "timestamp-of-signing": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                    "what-is-signed": "",
                    "assetid": "",
                    "hash-signed": ""
            }

            trust.append({
                "integrityAssurance": {
                    "hash": "",

                    "hash_type": "",

                    "hash_function":"",

                    "hasSignature": "",

                    "signature": {
                        hashlib.sha256(json.dumps(sig_obj).encode()).hexdigest():sig_obj
                    },

                    "securityRisk":{
                        "riskType": "",

                        "riskVector": "",

                        "riskScore":"",

                        "source":{}
                    },
                    "vulnerabilities":vulnerabilities(repo_url=repo_url),
                    "patches": {
                        "vulnerabilities_id": "",

                        "patch_id":"",

                        "timestamp":""
                    }
                }

            })

        return trust


    def xbom_(repo_url, _standard):
        xbom = []
        xbom.append({
            "standard": _standard,
            "trust": get_trust(repo_url, _standard, "")
        })
        return xbom

    def bom_(repo_url, _standard, bom_type ):
        bom_ = []
        sbom = gsb.getSbom_Scan_Sbom(repo_url, _standard, "")
        if sbom != "None":
            bom_.append({
                "bomtype": bom_type, 

                "standard": _standard, 

                "dep-graph": sbom, 

                "trust": get_trust(repo_url, _standard, bom_type)
            })
        return bom_


    def Generate_Bill_of_Materials(repo_url, _standard, _bomType):
        bom = []
        if _standard == "sbom" or _standard == "cycloneDX" and _bomType != "":
            bom.append({
                "bom": bom_(repo_url, _standard, _bomType),
            })
        else:
            bom.append({
                "xbom": xbom_(repo_url, _standard),
            })
        return bom

    def Get_CryptoBOM(reponame):
        resBOM = gcs.getCryptoDetector(reponame)[:-2][0]
        """
        Crypto BOM spec:
            hash of the object:{
                file_path,
                evidence_type,
                matched_text,
                quantum_safe,
            }
        """
        cryptoBOM = []
        for item in resBOM:
            cryptoBOM.append({
                hashlib.sha256(json.dumps(item).encode()).hexdigest():item
            })

        return cryptoBOM

    def getFBOM(repodir):
        repo_path = os.path.join(gitrepo_dir+repodir)
        return gfb.getFunctionsBOM(repo_path)


    # Graph BOM generation for speccific Github repo
    graphBOM = {
        "assetname": assetname, 
        
        "assettype": Asset_Type(assettype_param), 

        "assetreponame": assetreponame,

        "assetrepourl": assetrepourl,

        "assetidentity": Asset_Identity(assetname, assetreponame, assetrepourl ),

        "provenance": Provenance_Def(assetreponame),

        "BOMs": Generate_Bill_of_Materials(assetrepourl, standard, bomtype),

        "cryptoBOM": Get_CryptoBOM(assetreponame),

        "functionBOM": getFBOM(repo_dir), 
    }
    # print(graphBOM)

    # Entire Graph Hahs is generated 
    graphBOM_hash = hashlib.sha256(json.dumps(graphBOM).encode()).hexdigest()
    # print(f"\n GraphBOM Hash256 ==> {graphBOM_hash}")

    with open(os.path.join(gitrepo_dir+f"{assetreponame.split('/')[-1]}_graphBOM.json"), "w") as wbom:
        wbom.write(json.dumps(graphBOM))
        
    # return graphBOM

    return {"graphHash": graphBOM_hash,
            "assetreponame": assetreponame, 
            "graphBOM": graphBOM 
        }
