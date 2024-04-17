# MIT License

# Copyright (c) 2024 Cisco Systems, Inc. and its affiliates

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import mysql.connector as connector
from mysql.connector import Error
from decouple import config
import logging
import os

def getDatabaseConection():
    try:

        db_host = os.getenv("DB_HOST")
        repo_db = os.getenv("DB_DATABASE")
        db_user = os.getenv("DB_USER")
        pass_word = os.getenv("DB_PASSWORD")

        # connecting databases
        connection = connector.connect(
            host=db_host,
            database=repo_db,
            user=db_user,
            password=pass_word
        )
        
        if connection.is_connected():
            # creating database cursor
            return connection, connection.cursor()
        return None
    except Error as e:
        logging.error("Error while connecting to MySQL", e)


