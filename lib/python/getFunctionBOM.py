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
import glob
import ast

"""
This module collects the internal and extrnal bill of materials of functions 
functionBOM:{
    hash:{
        filepath: '':[
            function_name: ',
            is_function_external: Y/N,
            linenum: ,
            package_name: ,
            detection_method: 'keyword_match'
        ]
    }
}
    """
def getFunctionsBOM(filepath):
    functionBOM = list()
    print("=========Function BOM=========")
    print(f"======={filepath}======")
    file_list = []
    # Reading files from a dir recursively with specific extesions
    for path, currentDirectory, files in os.walk(filepath):
        for file in files:
            if  file.endswith('.py'):
                file_list.append(os.path.join(path, file))

    defs = []

    # for file in file_list:
    #         with open(file) as sf:
    #             cnt = 0
    #             dic = {}
    #             for line in sf:
    #                 cnt += 1
    #                 if line.startswith('#') :
    #                     commnets.append({"file_name": file, "text": line.strip(), "line_num": cnt})
    #                 if 'import' in line or 'from' in line:
    #                     key_words.append(line.strip())
    #                 if line.startswith('def ') or line.startswith('func '):
    #                     defs.append({'filen_name': file, 'def_name': line.strip(), 'line_num': cnt})
                    
    #                 contents.append({"file_name":file, "line":line.strip(), "line_num": cnt})
    # print(contents)

    import re

    def find_function_calls(line):
        # Define a regular expression pattern to match function calls
        pattern = r'[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*\.\w+\([^()]*\)'

        # Find all function calls in the line
        function_calls = re.findall(pattern, line)

        # Return the list of function calls
        return function_calls

    imports = list()
    # file_list = [sorted(file_list, reverse=True)[2]]
    for file in file_list:
        with open(file) as f:
            cnt = 0
            fbom_dic = {}
            for line in f:
                cnt+=1
                if line.startswith('import '):
                    line = line.split(' ')
                    name = ''.join(line[-1])
                    names = name.split(',')
                    for name in names:
                        name = name.split('.')
                        name, method = name[0], name[-1].strip()
                        imports.append({'filen_name': file, 'import_name': name, 'method_name': method, 'line_num': cnt})
                elif line.startswith('from '):
                    line = line.split('import')
                    name = line[0].strip()
                    method = line[1].strip()
                    name = name.split()[-1]
                    methods = method.split(',')
                    for method in methods:
                        method = method.split('.')
                        method = method[-1].strip()
                        # method = method.split()[-1]
                        imports.append({'filen_name': file, 'import_name': name, 'method_name': method, 'line_num': cnt})
                elif line.startswith('def '):
                    line = line.split()
                    name = ''.join(line[1:])
                    name = name.split('(')[0]
                    defs.append({'filen_name': file, 'def_name': name, 'line_num': cnt})
                else:
                    funcs = find_function_calls(line)
                    for func in funcs:
                        func = func.split('(')[0].strip()
                        tokens = func.split('.')
                        ltoken, rtoken = tokens[0].strip(), tokens[-1].strip()
                        fbom_dic = {
                            'file_path': file,
                            'function_name': rtoken,
                            'linenum': cnt,
                            'is_external_method': "No",
                            'package': ''
                        }
                        for importStmt in imports:
                            if importStmt['method_name'] == ltoken:
                                fbom_dic['is_external_method']= "Yes"
                                fbom_dic['package']= importStmt['import_name'].strip()

                        fbom_with_hash = {
                            hashlib.sha256(json.dumps(fbom_dic).encode()).hexdigest(): fbom_dic
                        }    
                        functionBOM.append(fbom_with_hash)

    return functionBOM
    