import * as tl from 'azure-pipelines-task-lib/task';
import * as rm from 'typed-rest-client';
import * as httpm from 'typed-rest-client/HttpClient'

// Response type interfaces
interface requestResponse {
    requestId: string;
}

interface requestStatus {
    requestId: string;
    status: string
}

// Constants
const mainflowLogId = '1';
const HttpStatusCreated = 201;

// Read URL from service connection
const apiEndpointData = getEndpointDetails('RestEndpoint');
const restServer: string = apiEndpointData.url;
const userId: string = apiEndpointData.username;
const password: string = apiEndpointData.password;

// Read values from configuration
const requiredValue: string = tl.getInput('InputValue1', true) || '';
const optionalValue: string = tl.getInput('OptionalValue1', false) || 'defaultvalue';

// Global references
let restClient: rm.RestClient;

async function main(): Promise<void> {
    try {
        // Timeout for confirmation is 300 seconds, unless running tests.
        const environmentValue = process.env.TASK_TEST_CONFIRMATION_TIMEOUT;
        let confirmationTimeout = 300;
        if (environmentValue != undefined) {
            tl.logDetail(mainflowLogId, `Running test config, timeout: ${environmentValue}`);
            confirmationTimeout = (parseInt(environmentValue) || 300);
        }

        // Get a new token
        tl.logDetail(mainflowLogId, `Get authorization token`);
        const authToken: string = await getToken(userId, password);

        // Create authenticated REST client, using token
        restClient = new rm.RestClient('AzureDevops-Task', restServer, [], {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // Do a Rest call
        tl.logDetail(mainflowLogId, `Get some entity`);
        const valueLookup = await getEntitydata();
        console.log(`Do something with ${valueLookup}`);

        // Do another Rest call
        tl.logDetail(mainflowLogId, `Post a request`);
        let requestId: string = await requestSomeProcess();
        tl.logDetail(mainflowLogId, `Followup the request, requestId: ${requestId}`);
        // Wait for request completion
        await waitForStopped(requestId, confirmationTimeout);
        tl.logDetail(mainflowLogId, `Call done`);

        tl.logDetail(mainflowLogId, 'Processing done');
        tl.setResult(tl.TaskResult.Succeeded, tl.loc("Succeeded"));
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, `${err}`);
    }
}

async function getToken(userId: string, password: string): Promise<string> {
    interface tokenResponse {
        token: string;
    }
    const tokenRequest = { username: userId, password: password };
    const getTokenUrl = `${restServer}/authentication/api/tokens`;

    const httpClient: httpm.HttpClient = new httpm.HttpClient('AzureDevops-Task', [], {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    const response: httpm.HttpClientResponse = await httpClient.post(getTokenUrl, JSON.stringify(tokenRequest));

    const responseBody: tokenResponse = JSON.parse(await response.readBody());
    const authToken = responseBody.token;

    if (authToken == undefined || authToken.length == 0) {
        throw new Error(`Not authenticated`);
    }

    return authToken;
}

async function getEntitydata(): Promise<string> {
    interface entityResponse {
        content: [{
            entity: [{
                name: string;
                prop1: string;
                prop2: string;
            }]
        }]
    }

    const catalogRequestUrl = `${restServer}/service/api/entity`;

    const response: rm.IRestResponse<entityResponse> = await restClient.get<entityResponse>(catalogRequestUrl);

    let entityProperty: string | undefined;

    if (response == null || response.result == null) {
        throw new Error('No entities found');
    } else {
        response.result.content.every(content => {
            content.entity.every(entity => {
                if (entity.name == requiredValue) {
                    entityProperty = entity.prop1;
                    return false;
                }
            })
            if (entityProperty != undefined && entityProperty.length > 0) {
                return false;
            }
        });
    }
    tl.logDetail(mainflowLogId, `Property found for  [${requiredValue}] = ${entityProperty}`)
    if (entityProperty == undefined || entityProperty.length == 0) {
        throw new Error(`No property for  ${requiredValue} found`);
    }

    return entityProperty;
}

async function requestSomeProcess(): Promise<string> {
    const someProcessRequestUrl = `${restServer}/service/api/otherentity`
    const someProcessRequest = {
        name: 'Something',
        data: {
            Prop1: 123,
            Prop2: optionalValue,
            Prop3: false
        }
    }

    const response: rm.IRestResponse<requestResponse> = await restClient.create(someProcessRequestUrl, someProcessRequest);

    if (response.statusCode != HttpStatusCreated) {
        // Something to do?
    }
    return response.result?.requestId ?? "";
}

async function waitForStopped(requestId: string, timeoutSeconds: number): Promise<void> {
    const requestStoppedStatus = 'STOPPED';
    const timeout: Date = new Date(new Date().getTime() + (1000 * timeoutSeconds));
    let requestStatus: requestStatus = { status: 'Running', requestId: requestId };

    while (new Date() < timeout) {
        requestStatus = await getstatus(requestId);
        tl.logDetail(mainflowLogId, `Current status of request is: ${requestStatus.status}`);
        if (requestStatus.status == requestStoppedStatus) {
            break;
        }
        // Wait 3 seconds before trying again.
        await new Promise(delay => setTimeout(delay, 3000));
    }
    if (requestStatus.status != requestStoppedStatus) {
        throw new Error(`Waiting for request completion timed out after ${timeoutSeconds} seconds`);
    }
}

async function getstatus(requestId: string): Promise<requestStatus> {
    const statusUrl = `${restServer}/service/api/requests/${requestId}`;

    const response: rm.IRestResponse<requestStatus> = await restClient.get<requestStatus>(statusUrl);

    if (response.result != undefined) {
        return response.result;
    } else {
        throw new Error(`Unable to get status for requestId: ${requestId}`);
    }
}

function getEndpointDetails(endpointInputFieldName) {
    const errorMessage = tl.loc("CannotDecodeEndpoint");
    const endpoint = tl.getInput(endpointInputFieldName, true);

    if (!endpoint) {
        throw new Error(errorMessage);
    }

    const url = tl.getEndpointUrl(endpoint, false) || '';
    const username = tl.getEndpointAuthorizationParameter(endpoint, 'username', false) || '';
    const password = tl.getEndpointAuthorizationParameter(endpoint, 'password', false) || '';

    return {
        url: url,
        username: username,
        password: password
    };
}

main();
