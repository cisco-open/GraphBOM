# Python Microservices 
These REST APIs will hit the flask python server. Run the Flask pythoin server before running these APIs. To run the server: `python3 -m flask --debug run --port 8000`. If your using default port `5000`, then modify the server inside `.sh` files. 

### Inastall the jq tool to format the output of every micorservice
- Linux or Ubuntu `sudo apt install jq`
- Mac OS `brew install jq`


## Bash Scripts
- To run the microservices use the bash command in Linux/Mac OS
- Command to run the `.sh` file. For example:  `bash getSBOM_scan.sh` or convert the `.sh` files as executable, use `chmod` command. 
- `chmod u+x getSBOM_scan.sh` then `./getSBOM_scan.sh`. 
- Enter the dynamic `PORT` number that the flask pythoin server runs on. 

### The graphBOM currently generates with pre-defined parameters. To automate, need to pass all the values are params.
- assetname
- assettype_param
- assetreponame
- assetrepourl
- standard
- bomtype
