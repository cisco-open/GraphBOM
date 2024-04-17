# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


"""
return all available entries of the given git repo 
"""
from python import DatabaseConnection as dbc
# import DatabaseConnection as dbc

def get_available_repos(url):

    _, curr = dbc.getDatabaseConection()
    query = "select distinct graph_hash, reponame, created_at, rate_limit from dependecny_graph order by created_at desc"
    curr.execute(query)
    records = curr.fetchall()
    rowData = []
    for item in records:
        rowData.append({'hash': item[0], 'repo': item[1], 'timestamp': item[2].strftime('%m-%d-%Y %H:%M:%S'), 'ratelimits': item[3]})

    # print(rowData)
    return rowData

# get_available_repos("cisco-open/flame")