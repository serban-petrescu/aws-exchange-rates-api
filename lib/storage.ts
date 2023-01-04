import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class Storage extends Construct {
    public readonly table: Table;

    constructor(scope: Construct, id: string) {
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
