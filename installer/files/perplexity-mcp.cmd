@echo off
REM Perplexity MCP Server Wrapper
REM This script runs the MCP server using the bundled Node.js runtime

setlocal

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"

REM Set path to bundled Node.js
set "NODE_EXE=%SCRIPT_DIR%node\node.exe"

REM Set path to server entry point
set "SERVER_JS=%SCRIPT_DIR%server\dist\index.js"

REM Verify Node.js exists
if not exist "%NODE_EXE%" (
    echo Error: Bundled Node.js not found at %NODE_EXE%
    echo Please reinstall Perplexity MCP Server.
    exit /b 1
)

REM Verify server exists
if not exist "%SERVER_JS%" (
    echo Error: Server not found at %SERVER_JS%
    echo Please reinstall Perplexity MCP Server.
    exit /b 1
)

REM Run the MCP server
"%NODE_EXE%" "%SERVER_JS%" %*

endlocal
