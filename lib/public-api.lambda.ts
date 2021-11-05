import api from 'lambda-api';
import getLogger from 'pino-lambda';
import { NotFoundError, RateRepository } from './rate-repository';

const logger = getLogger();
const repo = new RateRepository();

const app = api();

app.get('/dates/:date/rates', async function (request, response) {
    const date = request.params.date;
    const { from, to } = request.query;
    try {
        const rate = await repo.getDirectRate(date || '', from || '', to || '');
        response.type('text');
        response.send(rate + '');
        logger.info(`Read rate for ${date} from ${from} to ${to}.`);
    } catch (e) {
        if (e instanceof NotFoundError) {
            response.sendStatus(404);
            logger.info(`Did not find rate for ${date} from ${from} to ${to}.`);
        } else {
            response.sendStatus(500);
            logger.info(`Unable to read rate for ${date} from ${from} to ${to}.`, e);
        }
    }
});

export const handler = app.run.bind(app);
