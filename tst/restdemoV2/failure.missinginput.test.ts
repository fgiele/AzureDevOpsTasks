import * as mockServer from './serverResponseMocks'
import * as apmr from 'azure-pipelines-task-lib/mock-run';

const testrunner: apmr.TaskMockRunner = new apmr.TaskMockRunner(mockServer.TaskPath);

const endpointId = 'MockedEndpoint';

testrunner.setInput('OptionalValue1',mockServer.optionalValue);

process.env[`ENDPOINT_URL_${endpointId}`]= mockServer.ServerUrl;
process.env[`ENDPOINT_AUTH_PARAMETER_${endpointId}_USERNAME`]= mockServer.UserId;
process.env[`ENDPOINT_AUTH_PARAMETER_${endpointId}_PASSWORD`]= mockServer.Password;

mockServer.cleanUp();

mockServer.getTokenOk();
mockServer.getEntityOk();


testrunner.run();