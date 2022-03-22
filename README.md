# Demo tasks
This repository is meant to illustrate how to create, build, test an package Azure DevOps custom tasks. The main example contains code to read some properties from the task setting, including using a generic service connection. Then, some fictitional rest api's are called and responses handled.  
* The tests contain both happy flow as error flow scenario's, demonstrating how to use 'nock' to simulate the responses of the API.
* Code coverage is calculated
* Static code analysis (in the from of eslint for typescript) is executed
* VSIX package is created and uploaded as artifact
* In error situations, the entire workingdirectory is packaged, so the log files for the testcases can be consulted

## For developers
Since the test tool tries to download Node 10 and this causes some issues, the best approach is to do the following:

Create the following directories on you home location:  
%home%\azure-pipelines-task-lib\_download\Node10

Place the following version of Node in that directory:  
https://nodejs.org/dist/v10.21.0/win-x64/node.exe

Create an empty file named **node10.completed** and place this in:  
%home%\azure-pipelines-task-lib\_download

So your home location should look like this:  
**%home%**  
&nbsp;&nbsp;**azure-pipelines-task-lib**  
&nbsp;&nbsp;&nbsp;&nbsp;**_download**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*node10.completed*  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Node10**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*node.exe*  
