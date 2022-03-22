import nock = require('nock');
export const requiredValue = "XX12345";
export const optionalValue = "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d";

export const ServerUrl = "https://www.example.com";
export const UserId = "USERM01";
export const Password = "Welkom2021!";
export const AuthorizationToken = 'MySuperSecretToken';

export function cleanUp(){
    nock.cleanAll();
}

export function getTokenOk() {
    nock(ServerUrl)
        .post('/authentication/api/tokens')
        .reply(200, {
            "expires": "2040-12-31T23:59:59.000Z",
            "token": `${AuthorizationToken}`
        });
}

export function getTokenError() {
    nock(ServerUrl)
        .post('/authentication/api/tokens')
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
        .get('/service/api/entity')
        .reply(200, {
            "links": [],
            "content": [
                {
                    "entity": [
                        {
                            "name": requiredValue,
                            "prop1": "prop1value",
                            "prop2": "prop2value"
                        },
                        {
                            "name": "dummyname",
                            "prop1": "dummyvalue",
                            "prop2": "dummyvalue"
                        }
                    ]
                }
            ]
        });
}

export function getEntityFailed() {
    nock(ServerUrl, {
        reqheaders: {
            authorization: `Bearer ${AuthorizationToken}`,
        },
    })
        .get('/service/api/entity')
        .reply(200, {
            "links": [],
            "content": [
                {
                    "entity": [
                        {
                            "name": "dummyname",
                            "prop1": "dummyvalue",
                            "prop2": "dummyvalue"
                        },
                        {
                            "name": "dummy2name",
                            "prop1": "dummy2value",
                            "prop2": "dummy2value"
                        }
                    ]
                }
            ]
        });
}

export function getProcessOk(requestId: string) {
    nock(ServerUrl, {
        reqheaders: {
            authorization: `Bearer ${AuthorizationToken}`,
        },
    })
        .post('/service/api/otherentity')
        .reply(200, {
            "requestId": requestId
        });
}

export function getProcessFails(requestId: string) {
    nock(ServerUrl, {
        reqheaders: {
            authorization: `Bearer ${AuthorizationToken}`,
        },
    })
        .post('/service/api/otherentity')
        .reply(403);
}

export function getStatusStillRunning(requestId:string){
    nock(ServerUrl, {
        reqheaders: {
            authorization: `Bearer ${AuthorizationToken}`,
        },
    })
        .get(`/service/api/requests/${requestId}`)
        .reply(200, {
            "requestId": requestId,
            "status": "RUNNING"
        });
}

export function getStatusDone(requestId:string){
    nock(ServerUrl, {
        reqheaders: {
            authorization: `Bearer ${AuthorizationToken}`,
        },
    })
    .get(`/service/api/requests/${requestId}`)
        .reply(200, {
            "requestId": requestId,
            "status": "STOPPED"
        });
}