# Binary Image Scanner

This module analysis the Linux ELF or binary files and generates dependency graph between functions at assembly level language and determines the exceptions if any like buffer overflow or memory leakage based for different architecture support.

angr is a multi-architecture binary analysis toolkit, with the capability to perform dynamic symbolic execution (like Mayhem, KLEE, etc.) and various static analyses on binaries. To generate a dependency graph, the agnr library create multiple in-built modules LIKE Control Flow Graph (CFG), data dependency graph (DDG), and value flow graph (VFG).

## buf and segmentation

The buf and segmentation files are the object files generated from GCC compiler. (Segmentation fault code and buffer overflow code)

This API scans the binary images which are created under Linux OS flavours using `angr` package. The server runs by default port is `6000`.

### The `angr` library depends on the `cmake`. To install run the following command:

### Requisites

1. `brew install cmake` for OS X
2. `sudo apt install cmake` for Ubuntu

## To start the binary image Server

In the project directory under `binaryImagescanner-app`, you can run:

## Create a virtual enviroment

### `$python3 -m venv binaryimage`

## Enable Virtual environment:

### `$source binaryimage/bin/activate`

## Run the server:

### `$python3 -m flask run --port 6000`

## To stop the server:

`crtl+c`

## Deactivate the virtual environment:

### `$deactivate`
