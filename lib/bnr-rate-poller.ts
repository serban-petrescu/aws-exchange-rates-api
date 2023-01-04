import { Duration } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

import type { Storage } from './storage';

export type BnrRatePollerProps = {
    storage: Storage;
};

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
