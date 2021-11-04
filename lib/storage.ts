import { Construct } from '@aws-cdk/core';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';

interface StorageProps {}

export class Storage extends Construct {
    public readonly table: Table;

    constructor(scope: Construct, id: string, props: StorageProps) {
        super(scope, id);

        this.table = new Table(this, 'Table', {
            partitionKey: {
                name: 'Pk',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'Sk',
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
        });
    }
}
