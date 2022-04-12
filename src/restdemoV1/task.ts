import * as tl from 'azure-pipelines-task-lib/task';
import * as rm from 'typed-rest-client';
import * as httpm from 'typed-rest-client/HttpClient'
// Add import to the task.json to make sure the Typescript compiler copies the file to the output directory.
import * as taskconfig from './task.json'

// Request interface
interface RequestStatus {
    args: {
        requestId: string,
        status: string
    }
}

// Constants
const HttpStatusCreated = 201;

// Read URL from service connection
const apiEndpointData = getEndpointDetails('RestEndpoint');
const restServer: string = apiEndpointData.url;

// Read values from configuration
const requiredValue: string = tl.getInput('InputValue1', true) || '';
const optionalValue: string = tl.getInput('OptionalValue1', false) || 'defaultvalue';

// Global references
let restClient: rm.RestClient;

async function main(): Promise<void> {
    try {
        console.log(`Running version: ${taskconfig.version.Major}.${taskconfig.version.Minor}.${taskconfig.version.Patch}`);

        // Timeout for confirmation is 300 seconds, unless running tests.
        const environmentValue = process.env.TASK_TEST_CONFIRMATION_TIMEOUT;
        let confirmationTimeout = 300;
        if (environmentValue != undefined) {
            console.log(`Running test config, timeout: ${environmentValue}`);
            confirmationTimeout = (parseInt(environmentValue) || 300);
        }

        // Get a new token
        console.log(`Get authorization token`);
        const authToken: string = await getToken();

        // Create authenticated REST client, using token
        restClient = new rm.RestClient('AzureDevops-Task', restServer, [], {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // Do a Rest call
        console.log(`Get some entity`);
        const valueLookup = await getEntitydata();
        console.log(`Do something with ${valueLookup}`);

        // Do another Rest call
        console.log(`Post a request`);
        const requestId: string = await requestSomeProcess();
        console.log(`Followup the request, requestId: ${requestId}`);
        // Wait for request completion
        await waitForStopped(requestId, confirmationTimeout);
        console.log(`Call done`);

        console.log('Processing done');
        tl.setResult(tl.TaskResult.Succeeded, "Succeeded");
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, `${err}`);
    }
}

async function getToken(): Promise<string> {
    interface TokenResponse {
        json: {
            token: string
        }
    }
    const tokenRequest = { token: "MyToken" };
    const getTokenUrl = `${restServer}/post`;

    const httpClient: httpm.HttpClient = new httpm.HttpClient('AzureDevops-Task', [], {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    const response: httpm.HttpClientResponse = await httpClient.post(getTokenUrl, JSON.stringify(tokenRequest));

    const responseBody: TokenResponse = JSON.parse(await response.readBody());
    const authToken = responseBody.json?.token;

    if (authToken == undefined || authToken.length == 0) {
        throw new Error(`Not authenticated`);
    }

    return authToken;
}

async function getEntitydata(): Promise<string> {
    interface EntityResponse {
        args: {
            name: string;
            prop1: string;
            prop2: string;
        }
    }

    const catalogRequestUrl = `${restServer}/get?name=${requiredValue}&prop1=12345&prop2=abcde`;

    const response: rm.IRestResponse<EntityResponse> = await restClient.get<EntityResponse>(catalogRequestUrl);

    let entityProperty: string | undefined;

    if (response == null || response.result == null) {
        throw new Error('No entities found');
    } else {
        if (response.result.args.name == requiredValue) {
            entityProperty = response.result.args.prop1;
        }
    }
    console.log(`Property found for  [${requiredValue}] = ${entityProperty}`);
    if (entityProperty == undefined || entityProperty.length == 0) {
        throw new Error(`No property for  ${requiredValue} found`);
    }

    return entityProperty;
}

async function requestSomeProcess(): Promise<string> {
    interface RequestResponse {
        json: {
            name: string,
            data: {
                Prop1: number,
                Prop2: string,
                Prop3: boolean
            }
        }
    }
    const someProcessRequestUrl = `${restServer}/post`
    const someProcessRequest = {
        name: 'Something',
        data: {
            Prop1: 123,
            Prop2: optionalValue,
            Prop3: false
        }
    }

    const response: rm.IRestResponse<RequestResponse> = await restClient.create(someProcessRequestUrl, someProcessRequest);

    if (response.statusCode != HttpStatusCreated) {
        // Something to do?
    }
    return response.result?.json.name ?? "";
}

async function waitForStopped(requestId: string, timeoutSeconds: number): Promise<void> {
    const requestStoppedStatus = 'STOPPED';
    const timeout: Date = new Date(new Date().getTime() + (1000 * timeoutSeconds));
    let requestStatus: RequestStatus = { args: { status: 'Running', requestId: requestId } };

    while (new Date() < timeout) {
        requestStatus = await getstatus(requestId);
        console.log(`Current status of request is: ${requestStatus.args.status}`);
        if (requestStatus.args.status == requestStoppedStatus) {
            break;
        }
        // Wait 3 seconds before trying again.
        await new Promise(delay => setTimeout(delay, 3000));
    }
    if (requestStatus.args.status != requestStoppedStatus) {
        throw new Error(`Waiting for request completion timed out after ${timeoutSeconds} seconds`);
    }
}

async function getstatus(requestId: string): Promise<RequestStatus> {
    const statusUrl = `${restServer}/get?requestid=${requestId}&status=STOPPED`;

    const response: rm.IRestResponse<RequestStatus> = await restClient.get<RequestStatus>(statusUrl);

    if (response.result != undefined) {
        return response.result;
    } else {
        throw new Error(`Unable to get status for requestId: ${requestId}`);
    }
}

function getEndpointDetails(endpointInputFieldName: string) {
    const errorMessage = "Cannot Decode Endpoint";
    const endpoint = tl.getInput(endpointInputFieldName, true);

    if (!endpoint) {
        throw new Error(errorMessage);
    }

    const url = tl.getEndpointUrl(endpoint, false) || '';
    const usernameValue = tl.getEndpointAuthorizationParameter(endpoint, 'username', false) || '';
    const passwordValue = tl.getEndpointAuthorizationParameter(endpoint, 'password', false) || '';

    return {
        url: url,
        username: usernameValue,
        password: passwordValue
    };
}

main();
