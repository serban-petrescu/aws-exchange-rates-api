import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB.DocumentClient();

export class NotFoundError extends Error {}

export interface DirectRateInput {
    FromCurrency: string;
    ToCurrency: string;
    Date: string;
    Rate: number;
}

export interface DirectRate extends DirectRateInput {
    Pk: string;
    Sk: string;
    Type: 'DirectRate';
}

export function directRate(input: DirectRateInput): DirectRate {
    return {
        ...input,
        Type: 'DirectRate',
        Pk: `DirectRate#${input.Date}#${input.FromCurrency}`,
        Sk: `Currency#${input.ToCurrency}`,
    };
}

const BATCH_WRITE_MAX_SIZE = 25;

export class RateRepository {
    constructor(private table: string = process.env.STORAGE_TABLE_NAME || '') {}

    public async getDirectRate(date: string, from: string, to: string): Promise<number> {
        const item = await this.get<{ Rate: number }>(`DirectRate#${date}#${from}`, `Currency#${to}`, 'Rate');
        return item.Rate;
    }

    public async saveDirectRates(rates: DirectRate[]): Promise<void> {
        for (let i = 0; i < rates.length; i += BATCH_WRITE_MAX_SIZE) {
            const response = await ddb
                .batchWrite({
                    RequestItems: {
                        [this.table]: rates.slice(i, i + BATCH_WRITE_MAX_SIZE).map((rate) => ({
                            PutRequest: {
                                Item: rate,
                            },
                        })),
                    },
                })
                .promise();
            if (response.UnprocessedItems?.[this.table]?.length) {
                rates.push(...response.UnprocessedItems[this.table].map((item) => item.PutRequest?.Item as DirectRate));
            }
        }
    }

    private async get<T>(pk: string, sk: string, ...attributes: string[]): Promise<T> {
        const result = await ddb
            .get({
                TableName: this.table,
                Key: {
                    Pk: pk,
                    Sk: sk,
                },
                ProjectionExpression: attributes.length ? attributes.join(', ') : undefined,
            })
            .promise();
        if (result.Item) {
            return result.Item as T;
        } else {
            throw new NotFoundError();
        }
    }
}
