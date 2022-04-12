import nock = require('nock');
import * as path from 'path';

export const requiredValue = "XX12345";
export const optionalValue = "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d";

export const ServerUrl = "https://www.example.com";
export const UserId = "USERM01";
export const Password = "Welkom2021!";
export const AuthorizationToken = 'MySuperSecretToken';

export const TaskPath = path.join(__dirname, '../../src/restdemoV1', 'task.js');

export function cleanUp() {
    nock.cleanAll();
}

export function getTokenOk() {
    nock(ServerUrl)
        .post('/post')
        .reply(200, {
            "args": {},
            "data": "{\r\n    \"token\": \"abcdefg\"\r\n}",
            "files": {},
            "form": {},
            "headers": {
                "Accept": "*/*",
                "Content-Length": "28",
                "Content-Type": "application/json",
                "Host": "httpbin.org",
                "Postman-Token": "3357204f-f8e3-42a6-a7c4-b4c89304a499",
                "User-Agent": "PostmanRuntime/7.29.0",
                "X-Amzn-Trace-Id": "Root=1-624c4a9a-1c7231fb69ec17af7e6fd258"
            },
            "json": {
                "token": `${AuthorizationToken}`
            },
            "origin": "85.159.97.5",
            "url": "https://httpbin.org/post"
        });
}

export function getTokenError() {
    nock(ServerUrl)
        .post('/post')
        .reply(400, {
            "errors": [
                {
                    "code": 12345,
                    "source": null,
                    "message": "Unable to authenticate user.",
                    "systemMessage": "012345-Unable to authenticate user."
                }
            ]
        });
}

export function getEntityOk() {
    nock(ServerUrl, {
        reqheaders: {
            authorization: `Bearer ${AuthorizationToken}`,
        },
    })
        .get(`/get?name=${requiredValue}&prop1=12345&prop2=abcde`)
        .reply(200, {
            "args": {
                "name": requiredValue,
                "prop1": "12345",
                "prop2": "abcde"
            },
            "headers": {
                "Accept": "*/*",
                "Cache-Control": "max-stale=0",
                "Content-Type": "application/json",
                "Host": "httpbin.org",
                "Postman-Token": "8124497b-791b-4a6e-a511-4ec05b945479",
                "User-Agent": "PostmanRuntime/7.29.0",
                "X-Amzn-Trace-Id": "Root=1-624c4ca6-55edd439657ff1d808a28d68"
            },
            "origin": "85.159.97.5",
            "url": "https://httpbin.org/get?name=requiredValue&prop1=12345&prop2=abcde"
        });
}

export function getEntityFailed() {
    nock(ServerUrl, {
        reqheaders: {
            authorization: `Bearer ${AuthorizationToken}`,
        },
    })
        .get(`/get?name=${requiredValue}&prop1=12345&prop2=abcde`)
        .reply(200, {
            "args": {
                "name": "nope",
                "prop1": "12345",
                "prop2": "abcde"
            },
            "headers": {
                "Accept": "*/*",
                "Cache-Control": "max-stale=0",
                "Content-Type": "application/json",
                "Host": "httpbin.org",
                "Postman-Token": "8124497b-791b-4a6e-a511-4ec05b945479",
                "User-Agent": "PostmanRuntime/7.29.0",
                "X-Amzn-Trace-Id": "Root=1-624c4ca6-55edd439657ff1d808a28d68"
            },
            "origin": "85.159.97.5",
            "url": "https://httpbin.org/get?name=requiredValue&prop1=12345&prop2=abcde"
        });
}

export function getProcessOk(requestId: string) {
    nock(ServerUrl, {
        reqheaders: {
            authorization: `Bearer ${AuthorizationToken}`,
        },
    })
        .post('/post')
        .reply(200, {
            "args": {},
            "data": "{\r\n    \"name\": \"Something\",\r\n    \"data\": {\r\n        \"Prop1\": 123,\r\n        \"Prop2\": \"\",\r\n        \"Prop3\": false\r\n    }\r\n}",
            "files": {},
            "form": {},
            "headers": {
                "Accept": "*/*",
                "Content-Length": "121",
                "Content-Type": "application/json",
                "Host": "httpbin.org",
                "Postman-Token": "90826567-6430-4216-993d-37f541242c7d",
                "User-Agent": "PostmanRuntime/7.29.0",
                "X-Amzn-Trace-Id": "Root=1-624c4bbe-0177a0b4677aa46c276efe6a"
            },
            "json": {
                "data": {
                    "Prop1": 123,
                    "Prop2": "",
                    "Prop3": false
                },
                "name": requestId
            },
            "origin": "85.159.97.5",
            "url": "https://httpbin.org/post"
        });
}

export function getProcessFails() {
    nock(ServerUrl, {
        reqheaders: {
            authorization: `Bearer ${AuthorizationToken}`,
        },
    })
        .post('/post')
        .reply(403);
}

export function getStatusStillRunning(requestId: string) {
    nock(ServerUrl, {
        reqheaders: {
            authorization: `Bearer ${AuthorizationToken}`,
        },
    })
    .get(`/get?requestid=${requestId}&status=STOPPED`)
        .reply(200, {
            "args": {
                "requestid": requestId,
                "status": "RUNNING"
            },
            "headers": {
                "Accept": "*/*",
                "Cache-Control": "max-stale=0",
                "Content-Type": "application/json",
                "Host": "httpbin.org",
                "Postman-Token": "32373490-1a69-413b-af21-2b6ed24bf14d",
                "User-Agent": "PostmanRuntime/7.29.0",
                "X-Amzn-Trace-Id": "Root=1-624c48d8-3eea564432f4ba275c29f07d"
            },
            "origin": "85.159.97.5",
            "url": "https://httpbin.org/get?requestid=test&status=STOPPED"
        });
}

export function getStatusDone(requestId: string) {
    nock(ServerUrl, {
        reqheaders: {
            authorization: `Bearer ${AuthorizationToken}`,
        },
    })
        .get(`/get?requestid=${requestId}&status=STOPPED`)
        .reply(200, {
            "args": {
                "requestid": requestId,
                "status": "STOPPED"
            },
            "headers": {
                "Accept": "*/*",
                "Cache-Control": "max-stale=0",
                "Content-Type": "application/json",
                "Host": "httpbin.org",
                "Postman-Token": "32373490-1a69-413b-af21-2b6ed24bf14d",
                "User-Agent": "PostmanRuntime/7.29.0",
                "X-Amzn-Trace-Id": "Root=1-624c48d8-3eea564432f4ba275c29f07d"
            },
            "origin": "85.159.97.5",
            "url": "https://httpbin.org/get?requestid=test&status=STOPPED"
        });
}