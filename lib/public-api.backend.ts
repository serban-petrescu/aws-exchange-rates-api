import express from 'express';
import serverless from '@vendia/serverless-express';
import { NotFoundError, RateRepository } from './rate-repository';

const repo = new RateRepository();

const app = express();
app.use(express.json());
app.use(express.text());

app.get('/dates/:date/rates', async function (request: express.Request, response: express.Response) {
    try {
        const rate = await repo.getDirectRate(
            request.params.date,
            request.query.from as string,
            request.query.to as string
        );
        response.format({
            text: () => response.send(rate + ''),
            json: () => response.send({ value: rate }),
        });
    } catch (e) {
        if (e instanceof NotFoundError) {
            response.sendStatus(404);
        } else {
            response.sendStatus(500);
        }
    }
});

export const handler: any = serverless({ app });
