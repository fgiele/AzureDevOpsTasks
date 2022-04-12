import assert from 'assert';
import * as apmt from 'azure-pipelines-task-lib/mock-test';
import * as path from 'path';

process.env.TASK_TEST_TRACE = '1';
describe('Version 1 tests', function () {
    const versionPath = '/restdemoV1';
    const taskPath = path.join(__dirname, '../src', versionPath, 'task.json');
    describe('Happy flows', function () {
        const environmentValue: string | undefined = process.env.TASK_TEST_TIMEOUT;

        let testTimeout = 20000;
        if (environmentValue != undefined) {
            testTimeout = (parseInt(environmentValue) || 20000);
        }
        this.timeout(testTimeout);

        it('Normal flow, everything needs to be created', (done: Mocha.Done) => {
            const testSetup: string = path.join(__dirname, versionPath, 'success.normalflow.test.js');
            const testrun: apmt.MockTestRunner = new apmt.MockTestRunner(testSetup, taskPath);

            testrun.run();

            assert(testrun.succeeded);
            done();
        });

        it('Normal flow, processing is slow', (done: Mocha.Done) => {
            const testSetup: string = path.join(__dirname, versionPath, 'success.slowflow.test.js');
            const testrun: apmt.MockTestRunner = new apmt.MockTestRunner(testSetup, taskPath);

            testrun.run();

            assert(testrun.succeeded);
            done();
        });
    });

    describe('Error flows', function () {
        const environmentValue: string | undefined = process.env.TASK_TEST_TIMEOUT;

        let testTimeout = 20000;
        if (environmentValue != undefined) {
            testTimeout = (parseInt(environmentValue) || 20000);
        }
        this.timeout(testTimeout);

        it('Incomplete configuration', (done: Mocha.Done) => {
            const testSetup: string = path.join(__dirname, versionPath, 'failure.missinginput.test.js');
            const testrun: apmt.MockTestRunner = new apmt.MockTestRunner(testSetup, taskPath);

            testrun.run();

            assert(testrun.failed);
            assert(testrun.errorIssues.length == 1);
            assert(testrun.errorIssues[0] == "Unhandled: Input required: RestEndpoint");
            done();
        });

        it('Error flow, not authorized on token request', (done: Mocha.Done) => {
            const testSetup: string = path.join(__dirname, versionPath, 'failure.notauthorized.test.js');
            const testrun: apmt.MockTestRunner = new apmt.MockTestRunner(testSetup, taskPath);

            testrun.run();

            assert(testrun.failed);
            assert(testrun.errorIssues.length == 1);
            assert(testrun.errorIssues[0] == "Error: Not authenticated");
            done();
        });

        it('Error flow, failure to get entity', (done: Mocha.Done) => {
            const testSetup: string = path.join(__dirname, versionPath, 'failure.noentity.test.js');
            const testrun: apmt.MockTestRunner = new apmt.MockTestRunner(testSetup, taskPath);

            testrun.run();

            assert(testrun.failed);
            assert(testrun.errorIssues.length == 1);
            assert(testrun.errorIssues[0] == "Error: No property for  XX12345 found");
            done();
        });

        it('Error flow, failure to run process', (done: Mocha.Done) => {
            const testSetup: string = path.join(__dirname, versionPath, 'failure.processfails.test.js');
            const testrun: apmt.MockTestRunner = new apmt.MockTestRunner(testSetup, taskPath);

            testrun.run();

            assert(testrun.failed);
            assert(testrun.errorIssues.length == 1);
            assert(testrun.errorIssues[0] == "Error: Failed request: (403)");
            done();
        });
    });
});