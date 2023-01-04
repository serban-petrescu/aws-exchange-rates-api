import type { StackProps } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import { BnrRatePoller } from './bnr-rate-poller';
import { PublicApi } from './public-api';
import { Storage } from './storage';

export class RatesStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const storage = new Storage(this, 'Storage');
        new PublicApi(this, 'Api', { storage });
        new BnrRatePoller(this, 'Poller', { storage });
    }
}
