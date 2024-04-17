# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


from subprocess import PIPE, Popen
import os
import json
import hashlib
import urllib3
from glob import glob
""""
The Crypto-detector API is integrated in this project. For m ore details please visit: https://github.com/Wind-River/crypto-detector
The scan-for-crypto.py is the main file and triggered by subprocess in python.
This method returns any crypto key wods are matched in the reponame as JSON object. It scans only the source files only. If no crypto key words found the methid return None as string.
"""

# get currewnt logged in USER Home
loggedin_user  = os.path.expanduser('~')

# Verifying crypto-detector is available in the Home dir
crypto_detector_path = os.getenv("FILE_PATH")+'/crypto-detector/'
gitrepo_dir = os.getenv("FILE_PATH")+'/gitrepo/data/'

# Latest NIST Asymetric algorithms list - https://csrc.nist.gov/Projects/post-quantum-cryptography/selected-algorithms-2022
asymmetric_crpypto = ['CRYSTALS-KYBER', 'CRYSTALS-DILITHIUM', 'FALCON', 'SPHINCS+', 'SHA', 'AES']

# Get the status of the URL
http = urllib3.PoolManager()

def getCryptoDetector(reponame):
    owner, reponame = reponame.split('/')

    #Get main/master branch
    git_local_branch = gitrepo_dir+reponame+'/.git/refs/heads/*'
    print("git local branch-----",git_local_branch)
    git_branch = glob(git_local_branch)
    print("git branch----",git_branch)
    branch = git_branch[0].split('/')[-1]
    print("branch-----",branch)

    if not os.path.exists(crypto_detector_path):
        print(f"crypto-detector not found in {loggedin_user}")
        print("Download: git clone https://github.com/Wind-River/crypto-detector")
    else:
        """
        getCryptoDetector - args - <repo name>
        scan-for-crypto.py - default args
            -v <false>
            --keyword-ignore-case
            --methods=keyword,api
            -c cryptodetector.conf
            --source-files-only=True
            --output-existing=overwrite
            -o <output dir>
        """
        sbom_cmd = f'{crypto_detector_path}scan-for-crypto.py -v false --keyword-ignore-case --methods=keyword,api -c {crypto_detector_path}cryptodetector.conf {gitrepo_dir}{reponame} --source-files-only=True  --output-existing=overwrite -o {gitrepo_dir} '
        capture_cmd_result = Popen(sbom_cmd, stdout=PIPE, shell=True)
        flag = capture_cmd_result.communicate()[0].decode('utf-8').split() 
        if 'done' in flag:
            detectors = []
            detect_file = f"{gitrepo_dir}{reponame}.crypto"
            with open(detect_file) as file:
                detectorObj = json.loads(file.read())
            root_file = detectorObj['crypto_evidence']
            if len(root_file) > 0:
                git_url = f"https://github.com/{owner}/{reponame}"
                safe = 0
                unsafe = 0
                need_to_work = 0
                risk_factor_safe = 0
                risk_factor_unsafe = 0
                risk_factor_needtowork = 0
                for files in root_file:
                    for item in root_file[files]['hits']:
                        for file_path in root_file[files]['file_paths']:
                            temp_path = file_path.split('/', 9)[-1]
                            print(temp_path)
                            gitPath = f"{git_url}/blob/{branch}/{temp_path}/#L{item['line_number']}"
                            
                            if 'asymmetric' in item['evidence_type'].lower()  or 'hash' in item['evidence_type'].lower() or 'aes' in item['evidence_type'].lower() :
                                detectors.append({
                                            'file_path': gitPath,
                                            'evidence_type': item['evidence_type'],
                                            'matched_text': item['matched_text'],
                                            'quantum_safe': 'Yes'
                                })
                                safe += 1
                                risk_factor_safe += 0.1
                            elif 'symmetric' in item['evidence_type'].lower() and not 'aes' in item['evidence_type'].lower():
                                detectors.append({
                                            'file_path': gitPath,
                                            'evidence_type': item['evidence_type'],
                                            'matched_text': item['matched_text'],
                                            'quantum_safe': 'No'
                                })
                                unsafe += 1
                                risk_factor_unsafe += 1
                            else:
                                detectors.append({
                                            'file_path': gitPath,
                                            'evidence_type': item['evidence_type'],
                                            'matched_text': item['matched_text'],
                                            'quantum_safe': 'Needs work'
                                })
                                need_to_work += 1
                                risk_factor_needtowork += 1

                stats = [{'Safe': safe, 'Unsafe': unsafe, 'Need_to_work': need_to_work}]
                pie_chart_data = [{'values': [safe, unsafe, need_to_work], 'labels': ['Safe', 'Unsafe', 'Need to Work'], 'type': 'pie'}]
                print(pie_chart_data)
            
                return [detectors, pie_chart_data, stats]
            else:
                return "None"
        else:
            return flag

# getCryptoDetector("Wind-River/boundless")