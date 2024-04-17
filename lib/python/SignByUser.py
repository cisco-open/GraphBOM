# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


from Crypto.Hash import SHA256
from Crypto.PublicKey import ECC
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Signature import DSS
from base64 import b64encode

def sign_with_privatekey(content, formdata):
    msg = formdata['hashValue'].encode()
    
    if formdata['algo'] == 'RSA' or formdata['algo'] == 'rsa':
        try:
            h = SHA256.new(msg)
            key = RSA.import_key(content)
            signature = pkcs1_15.new(key).sign(h)
            return b64encode(signature).hex()
        except ValueError as ve:
            return ve
    if formdata['algo'] == 'ECDSA' or formdata['algo'] == 'ecdsa':
        try:
            h = SHA256.new(msg)
            key = ECC.import_key(content)
            signer = DSS.new(key, 'fips-186-3')
            signature = signer.sign(h)
            return b64encode(signature).hex()
        except ValueError as ve:
            return ve
