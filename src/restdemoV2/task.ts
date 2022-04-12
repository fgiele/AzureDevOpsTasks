import * as tl from 'azure-pipelines-task-lib/task';
import * as rm from 'typed-rest-client';
import * as httpm from 'typed-rest-client/HttpClient'
// Add import to the task.json to make sure the Typescript compiler copies the file to the output directory.
import * as taskconfig from './task.json'

// Read URL from service connection
const apiEndpointData = getEndpointDetails('RestEndpoint');
const restServer: string = apiEndpointData.url;

// Read values from configuration
const requiredValue: string = tl.getInput('InputValue1', true) || '';

// Global references
let restClient: rm.RestClient;

async function main(): Promise<void> {
    try {
        console.log(`Running version: ${taskconfig.version.Major}.${taskconfig.version.Minor}.${taskconfig.version.Patch}`);

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
