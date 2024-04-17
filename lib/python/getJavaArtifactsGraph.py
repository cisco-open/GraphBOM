# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import json
import os


def get_artifacts_graph():

    SRCDIR = os.path.dirname(os.path.abspath(__file__))
    jasonlPath = os.path.join(SRCDIR, 'data.jsonl')
    data = open(jasonlPath)


    val = data.readlines()
    tmp_edges = set()
    tmp_nodes = set()
    edges = []

    for item in val:
        tmp = json.loads(item.strip())
        sourceId = tmp["artifactGroup"].strip()+"_"+tmp["artifactId"].strip()
        targetId = tmp["applicationName"].strip()+"_"+tmp["targetClass"].strip()+"_"+tmp["targetMethod"].strip()
        edges.append({'source': sourceId, 'target':targetId} )

        if sourceId not in tmp_nodes or targetId not in tmp_nodes:
            tmp_nodes.add(sourceId)
            tmp_nodes.add(targetId)

    nodes = [{'id': val} for val in tmp_nodes]

    return {'nodes': nodes, 'edges': edges}

# get_artifacts_graph()
