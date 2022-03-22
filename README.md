## For developers

Since the test tool tries to download Node 10 and this causes some issues, the best approach is to do the following:

Create the following directories on you home location:  
%home%\azure-pipelines-task-lib\_download\Node10

Place the following version of Node in that directory:  
https://nodejs.org/dist/v10.21.0/win-x64/node.exe

Create an empty file named **node10.completed** and place this in:  
%home%\azure-pipelines-task-lib\_download

So your N disk should look like this:  
**%home%**  
&nbsp;&nbsp;**azure-pipelines-task-lib**  
&nbsp;&nbsp;&nbsp;&nbsp;**_download**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*node10.completed*  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Node10**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*node.exe*  