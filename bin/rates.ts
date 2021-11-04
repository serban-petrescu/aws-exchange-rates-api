#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RatesStack } from '../lib/rates-stack';

const app = new cdk.App();
new RatesStack(app, 'RatesStack', {
    env: { account: '403027346271', region: 'eu-central-1' },
});
