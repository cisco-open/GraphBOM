# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import angr
import networkx as nx
import json
import re

#The buf and segmentation files are the object files generated from GCC compiler. (Segmentation fault code and buffer overflow code)
def get_binary_image_graph():
    project = angr.Project('./buf', load_options={'auto_load_libs':False})
    cfg = project.analyses.CFGEmulated()
    cdg = project.analyses.CDG(cfg)

    cfg_nx = cdg.graph.copy()

    # Create dictionary to hold JSON data
    data_json = {
        'nodes': [],
        'links': []
    }

    for node in cfg_nx.nodes():
        if node.name != None and len(node.name) > 0:
            data_json['nodes'].append({
                'id': node.name
            })    

    for src, dst in cfg_nx.edges():
        if src.name != None and len(src.name) > 0 and dst.name != None and len(dst.name) > 0:
            data_dict = {
                'source': src.name,
                'target': dst.name,
            }
            data_json['links'].append(data_dict)

    nl=[]
    for i in data_json["nodes"]:
        nl.append(i['id'])

    nl = list(set(nl))

    ll=[]
    same_node = []
    for i in data_json["links"]:
        ll.append(i['source'])
        ll.append(i['target'])
        if i['source'] == i['target']:
            same_node.append(i['source'])
    ll = list(set(ll))


    fd=[]
    for i in nl:
        if i not in ll or i in same_node:
            fd.append({'id': i, "color":"red", "size":500})
        else:
            fd.append({'id': i})

    data_json['nodes'] = fd

    res = json.dumps(data_json, indent=4)
    
    return res
