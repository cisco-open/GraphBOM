# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import hashlib
from decouple import config

""""
This file implemented using https://ieeexplore.ieee.org/document/8118163
"""

key = config("SECRET_KEY")
keyhash = hashlib.sha256(key.encode('utf-8')).hexdigest()

randiom_str = config("RANDOM_KEY")
r = hashlib.sha256(randiom_str.encode('utf-8')).hexdigest()


#Algorithm 1: gHMAC (Compute graph HMAC for twoparty data publishing model.)
def gHMAC(nodes, edges):
    sourceList = []
    u_list = []
    ghash=''
    for node in nodes:
        u_list.append({'node': node['id'], 'color': 'WHITE', 'outList': set(), 'labelHash': '0', 'hashVal':''})
    for nodeIndex in range(len(u_list)):
        if u_list[nodeIndex]['color'] == 'WHITE':
            sourceList.append(u_list[nodeIndex]['node'])
            ghash, u_list = DFS_VISIT(nodes,edges,u_list,nodeIndex,ghash)
    iPad_ghash = hashlib.sha256((hex(int(keyhash,16)^int('5c',16)) + r + ghash)[2:].encode('utf-8')).hexdigest()
    tG_temp_hash =  hex(int(keyhash,16)^int('36',16))[2:] + iPad_ghash
    tG = hashlib.sha256((tG_temp_hash).encode('utf-8')).hexdigest()

    # print(f"Original source List ---> {sourceList}")
    # print(f"Original gHASH ---> {tG}")
    return (tG, sourceList, u_list)


def DFS_VISIT(nodes,edges, u_list, currentNodeIndex,ghash):
    u_list[currentNodeIndex]['color'] = "GRAY"
    # print(u_list)
    decendents = set()
    out_xor = u_list[currentNodeIndex]['labelHash'] = hashlib.sha256((u_list[currentNodeIndex]["node"]).encode('utf-8')).hexdigest()
    for edge in edges:
        if edge['source'] == u_list[currentNodeIndex]['node']:
            u_list[currentNodeIndex]['outList'].add(edge['target'])
            decendents.add(edge['target'])
    for target in decendents:
        u_list[currentNodeIndex]['outList'].add(target)
        for vIndex in range(len(u_list)):
            if u_list[vIndex]['node'] == target:
                if u_list[vIndex]['labelHash'] == '0':
                    u_list[vIndex]['labelHash'] = hashlib.sha256((u_list[vIndex]["node"]).encode('utf-8')).hexdigest()
                out_xor = hex(int(out_xor, 16) ^ int(u_list[vIndex]['labelHash'], 16))[2:]
                if u_list[vIndex]['color'] == 'WHITE':
                    _,u_list = DFS_VISIT(nodes, edges, u_list, vIndex,"")

    u_list[currentNodeIndex]['color'] = 'BLACK'
    contentString = ""
    for i in range(len(nodes)):
        if nodes[i]['id'] == u_list[currentNodeIndex]['node']:
            for j in nodes[i].keys():
                # id, color, size are not part of Graph HASH... 
                if j != "id" and j != "size" :
                    contentString += str(nodes[i][j])

    hashingValue = r + out_xor + u_list[currentNodeIndex]['node'] + contentString
    u_list[currentNodeIndex]['hashVal'] = hashlib.sha256((hashingValue).encode('utf-8')).hexdigest()
    temp_ghash = r + ghash + u_list[currentNodeIndex]['hashVal']
    ghash = hashlib.sha256((temp_ghash).encode('utf-8')).hexdigest()
    return ghash, u_list

#Algorithm 2: gVrfy (Verify graph integrity using HMAC tag for two-party data publishing model.)
def gVrfy(nodes, edges, tG, source_list, u_list_full):
    u_list_vrfy = []
    ghash_vrfy=''
    for node in nodes:
        u_list_vrfy.append({'node': node['id'], 'color': 'WHITE', 'outList': set(), 'labelHash': '0', 'hashVal':''})
    i = 0
    while(i<len(source_list)):
        node_name = source_list[i]
        for node in range(len(u_list_vrfy)):
            if node_name == u_list_vrfy[node]['node']:
                if u_list_vrfy[node]['color']=="WHITE":
                        ghash_vrfy,u_list_vrfy = DFS_VISIT_VRFY(nodes,edges,u_list_vrfy,node,ghash_vrfy,u_list_full)
        i += 1

    iPad_ghas_vrfy = hashlib.sha256((hex(int(keyhash,16)^int('5c',16)) + r + ghash_vrfy)[2:].encode('utf-8')).hexdigest()                
    tG_temp_vrfy = hex(int(keyhash,16)^int('36',16))[2:] + iPad_ghas_vrfy
    tG_vrfy = hashlib.sha256((tG_temp_vrfy).encode('utf-8')).hexdigest()
   
    # print(f"Verfiy gHASH list----> {source_list}")
    # print(f"gVerify Hash --> {tG_vrfy}")
    if tG_vrfy == tG:
        return 1
    else:
        return 0

def DFS_VISIT_VRFY(nodes, edges, u_list,currentNodeIndex,ghash,u_list_full):
    u_list[currentNodeIndex]['color'] = "GRAY"
    out_xor = u_list[currentNodeIndex]['labelHash']= hashlib.sha256((u_list[currentNodeIndex]["node"]).encode('utf-8')).hexdigest()
    for node_prev in u_list_full:
        if node_prev['node'] == u_list[currentNodeIndex]['node']:
            for target in node_prev['outList']:
                u_list[currentNodeIndex]['outList'].add(target)
                for vIndex in range(len(u_list)):
                    if u_list[vIndex]['node'] == target:
                        if u_list[vIndex]['labelHash'] == '0':
                            u_list[vIndex]['labelHash'] = hashlib.sha256((u_list[vIndex]["node"]).encode('utf-8')).hexdigest()
                            
                        out_xor = hex(int(out_xor, 16) ^ int(u_list[vIndex]['labelHash'], 16))[2:]
                        if u_list[vIndex]['color'] == 'WHITE':
                            _,u_list = DFS_VISIT_VRFY(nodes,edges,u_list,vIndex,"",u_list_full)

    u_list[currentNodeIndex]['color'] = 'BLACK'
    contentString = ""
    for i in range(len(nodes)):
        if nodes[i]['id'] == u_list[currentNodeIndex]['node']:
            for j in nodes[i].keys():
                # id, color, size are not part of Graph HASH... 
                if j != "id" and j != "size":
                    contentString += str(nodes[i][j])

    hashingValue = r + out_xor + u_list[currentNodeIndex]['node'] + contentString
    u_list[currentNodeIndex]['hashVal'] = hashlib.sha256((hashingValue).encode('utf-8')).hexdigest()

    temp_ghash = r + ghash + u_list[currentNodeIndex]['hashVal']
    ghash = hashlib.sha256((temp_ghash).encode('utf-8')).hexdigest()
    return ghash,u_list


# tg, sourceList, u_list = gHMAC(graph_nodes, new_edges)

# gverfy = gVrfy(graph_nodes, new_edges, tg, sourceList, u_list)
# print(gverfy)

# This is computing only the HASH of the graph using SHA256 as per the Alg1: line 1 - 11 from the Paper (Page: 6)
# def graphHash(nodes, edges):
#     sourceList = []
#     u_list = []
#     ghash=''
#     for node in nodes:
#         u_list.append({'node': node['id'], 'color': 'WHITE', 'outList': set(), 'labelHash': '0', 'hashVal':''})
#     for nodeIndex in range(len(u_list)):
#         if u_list[nodeIndex]['color'] == 'WHITE':
#             sourceList.append(u_list[nodeIndex]['node'])
#             ghash, u_list = DFS_VISIT(nodes,edges,u_list,nodeIndex,ghash)
 
#     # print(f"Original source List ---> {sourceList}")
#     # print(f"Original gHASH ---> {tG}")
#     return (ghash, sourceList, u_list)


# def verifyGraphHash(nodes, edges, tG, source_list, u_list_full):
#     u_list_vrfy = []
#     ghash_vrfy=''
#     for node in nodes:
#         u_list_vrfy.append({'node': node['id'], 'color': 'WHITE', 'outList': set(), 'labelHash': '0', 'hashVal':''})
#     i=0
#     while(i<len(source_list)):
#         node_name = source_list[i]
#         for node in range(len(u_list_vrfy)):
#             if node_name == u_list_vrfy[node]['node']:
#                 if u_list_vrfy[node]['color']=="WHITE":
#                         ghash_vrfy,u_list_vrfy = DFS_VISIT_VRFY(nodes,edges,u_list_vrfy,node,ghash_vrfy,u_list_full)
#         i+=1

#     ### This is for gHMAC verification not for Hash verification
#     # iPad_ghas_vrfy = hashlib.sha256((hex(int(keyhash,16)^int('5c',16)) + r + ghash_vrfy)[2:].encode('utf-8')).hexdigest()                
#     # tG_temp_vrfy = hex(int(keyhash,16)^int('36',16))[2:] + iPad_ghas_vrfy
#     hash_verify = hashlib.sha256((ghash_vrfy).encode('utf-8')).hexdigest()
   
#     # print(f"Verfiy gHASH list----> {source_list}")
#     # print(f"gVerify Hash --> {tG_vrfy}")
#     if hash_verify == tG:
#         return 1
#     else:
#         return 0
