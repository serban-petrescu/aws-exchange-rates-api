import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct, Duration } from '@aws-cdk/core';
import { join } from 'path';
import { Storage } from './storage';

export interface BnrRatePollerProps {
    storage: Storage;
}

export class BnrRatePoller extends Construct {
    constructor(scope: Construct, id: string, props: BnrRatePollerProps) {
        super(scope, id);

        const poller = new NodejsFunction(this, 'Poller', {
            entry: join(__dirname, 'bnr-rate-poller.lambda.ts'),
            bundling: { metafile: true },
            timeout: Duration.seconds(30),
            environment: {
                STORAGE_TABLE_NAME: props.storage.table.tableName,
            },
        });
        props.storage.table.grantWriteData(poller);

        new Rule(this, 'Schedule', {
            schedule: Schedule.cron({ hour: '12', minute: '0' }),
            targets: [new LambdaFunction(poller)],
        });
    }
}
