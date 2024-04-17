# Blockchain API

This module interacts with Ethereum protocol using Web3.py, a powerful API that can interact with blockchain. Ethereum is decentralized blockchain module that allows users to develop blockchain network using web3.py python library using fast API. The DG-SSCS application uses web3.py to sign the developers and their public repos using public key and private keys. Web3.py can help you read block data, sign and send transactions, deploy and interact with contracts, and other features as well.

## Ethereum testnet

There are several types of Ethereum testnets; in this module, we utilized goerli.infura.io serves as an infura endpoint for the Goerli testnet. Infura is a service that provides Ethereum nodes as a service, allowing developers to connect to the Ethereum blockchain without running their own node. Goerli is an Ethereum testnet for developers to test smart contracts and decentralized applications without using real cryptocurrency on the main network.

If you want to use another available testnet, you can replace goeril.infura.io in client_fastapiV3.py with a different type of testnet.

## Updating /blockchain-api/.env file

Please update the environment variables before running the code:

- Use `/lib/.env` database credentials in the `/blockchain-api/.env` file.
- WALLET_ADDRESS = 'It is a unique identifier for a cryptocurrency wallet.'
- WALLET_PRIVATE_KEY = 'The private key is a secret code allowing access to the wallet.'
- CONTRACT_ADDRESS = 'Please specify contract address associated with the smart contract.'
- WEB3_API_KEY = 'Please specify your web3 api key.'

## GraphBOM/blockchain-api installation 

1. Change path of the abi(aplication binary interface) in the code. You can obtain abi from your compiler (ex. remix.ethereu.org or truffle) or blockchain explorers.
2. You need fastapi and uvicorn to run that. Use pip to install both of them
3. When you run the code, you can find the docs at http://localhost:7000/docs#/
4. Database connection is same as `/lib/.env` details. The Web3 update the Transaction Hash to database table.
5. Create new virtual environment for blockchain API
   - `python3 -m venv env`
6. Activate the python virtual enviroment
   - `source emv/bin/activate`
7. Command to run Web3 app - `python3 -m uvicorn client_fastapiV3:app --reload --port 7000`
