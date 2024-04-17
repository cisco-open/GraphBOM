# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


from subprocess import run, PIPE, Popen
import os

def get_scanner_graph(tag):
    loggedin_user  = os.path.expanduser('~')
    
    if 'latest' in tag:
        binary_img = tag
    else:
        binary_img = tag+":latest"

    # Capture the Docker deamin running or not 
    result = run(["docker", "ps"], capture_output=True, text=True)
    
    if result.returncode == 0:
        syft_path = os.getenv("FILE_PATH")+"/syft"
        syft_cmd = f"{syft_path} docker:{binary_img} --scope all-layers -o table"
        capture_cmd_result = Popen(syft_cmd, stdout=PIPE, shell=True)
        # out = json.loads((capture_cmd_result.communicate()[0]))
        out = (capture_cmd_result.communicate()[0])
        
        val = out.decode().split('\n')[1:]
        sbom = []

        for item in val:
            item = item.split(' ')
            item = list(filter(lambda a: a != '', item))
            if item:
                sbom.append({'name': item[0], 'version': item[1], 'type':item[2]})

        # Vulnarability scanner
        grype_path = os.getenv("FILE_PATH")+"/grype"
        grype_cmd = f"{grype_path} docker:{binary_img} -o table"
        capture_grype_cmd = Popen(grype_cmd, stdout=PIPE, shell=True)
        # out = json.loads((capture_cmd_result.communicate()[0]))
        grype_out = (capture_grype_cmd.communicate()[0])

        vul = grype_out.decode().split('\n')[1:]
        vulList = []

        cve_ids = set()
        severity = set()
        severity_high = []
        severity_critical = []
        severity_medium = []
        severity_low = []
        severity_unknown = []

        for item in vul:
            item = item.split(' ')
            item = list(filter(lambda a: a != '', item))
            if len(item) > 6:
                vulList.append({'name': item[0], 'installed': item[1], 'fixed-in':item[2]+" "+item[3] , 'type': item[4], 'cve_id': item[5], 'severity': item[6]})
                cve_ids.add(item[4])
                if item[6] == 'High':
                    severity_high.append(item[6])
                if item[6] == 'Critical':
                    severity_critical.append(item[6])
                if item[6] == 'Medium':
                    severity_medium.append(item[6])
                if item[6] == 'Low':
                    severity_low.append(item[6]) 
                if item[6] == 'Unknown':
                    severity_unknown.append(item[6]) 
            elif len(item) == 5:
                vulList.append({'name': item[0], 'installed': item[1], 'fixed-in':'', 'type': item[2], 'cve_id': item[3], 'severity': item[4]})
                cve_ids.add(item[3])
                severity.add(item[4])
                if item[4] == 'High':
                    severity_high.append(item[4])
                if item[4] == 'Critical':
                    severity_critical.append(item[4])
                if item[4] == 'Medium':
                    severity_medium.append(item[4])
                if item[4] == 'Low':
                    severity_low.append(item[4]) 
                if item[4] == 'Unknown':
                    severity_unknown.append(item[4])

        params = [  
                    {"params": "Container name", "values": binary_img},
                    {"params": "Repo URL", "values": 'https://hub.docker.com/_/'+binary_img.split(':')[0]},  
                    {"params": "Unique CVE IDs", "values": len(cve_ids)},
                    {"params": "# Severity Hihg", "values": len(severity_high)},
                    {"params": "# Severity Critical", "values": len(severity_critical)},
                    {"params": "# Severity Medium", "values": len(severity_medium)},
                    {"params": "# Severity Low", "values": len(severity_low)},
                    {"params": "# Severity Unknown", "values": len(severity_unknown)}
                ]
        print(params)
        
        return {'img_name': binary_img, 'sbom': sbom, 'vul': vulList, 'params': params}
    else:
        return str(result.stderr)
    

# print(get_scanner_graph('node'))