import type { IRestApi } from 'aws-cdk-lib/aws-apigateway';
import { ApiKeySourceType, LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

import type { Storage } from './storage';

type PublicApiProps = {
    storage: Storage;
};

export class PublicApi extends Construct {
    public readonly api: IRestApi;

    constructor(scope: Construct, id: string, props: PublicApiProps) {
        super(scope, id);

        const backend = new NodejsFunction(this, 'Backend', {
            entry: join(__dirname, 'public-api.lambda.ts'),
            bundling: { metafile: true },
            environment: {
                STORAGE_TABLE_NAME: props.storage.table.tableName,
            },
        });
        props.storage.table.grantReadData(backend);

        const api = new LambdaRestApi(this, 'Api', {
            apiKeySourceType: ApiKeySourceType.HEADER,
            handler: backend,
            defaultMethodOptions: {
                apiKeyRequired: true,
            },
        });

        const plan = api.addUsagePlan('UsagePlan', {
            name: 'Basic',
            throttle: {
                rateLimit: 5,
                burstLimit: 10,
            },
        });
        const key = api.addApiKey('Key');
        plan.addApiKey(key);
        plan.addApiStage({ stage: api.deploymentStage });

        this.api = api;
    }
}
