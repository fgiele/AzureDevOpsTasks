import * as mockServer from './serverResponseMocks'
import * as apmr from 'azure-pipelines-task-lib/mock-run';
import * as path from 'path';

const taskPath = path.join(__dirname, '../src', 'task.js');
const testrunner: apmr.TaskMockRunner = new apmr.TaskMockRunner(taskPath);

const endpointId = 'MockedEndpoint';

const requestId="secreqid-0001";

testrunner.setInput('InputValue1', mockServer.requiredValue);
testrunner.setInput('OptionalValue1',mockServer.optionalValue);

process.env[`ENDPOINT_URL_${endpointId}`]= mockServer.ServerUrl;
process.env[`ENDPOINT_AUTH_PARAMETER_${endpointId}_USERNAME`]= mockServer.UserId;
process.env[`ENDPOINT_AUTH_PARAMETER_${endpointId}_PASSWORD`]= mockServer.Password;

mockServer.cleanUp();

mockServer.getTokenOk();
mockServer.getEntityOk();
mockServer.getProcessOk(requestId);
mockServer.getStatusStillRunning(requestId);
mockServer.getStatusDone(requestId);


testrunner.run();