import getLogger from 'pino-lambda';
import fetch from 'node-fetch';
import { parse } from 'fast-xml-parser';
import { directRate, RateRepository } from './rate-repository';

const logger = getLogger();

const BRN_URL = 'https://www.bnr.ro/nbrfxrates.xml';

interface Cube {
    date: string;
    Rate: {
        currency: string;
        value: number;
    }[];
}

interface BnrResponse {
    DataSet: {
        Body: BnrResponseBody;
    };
}

interface BnrResponseBody {
    OrigCurrency: string;
    Cube: Cube | Cube[];
}

async function callBnr(): Promise<BnrResponseBody> {
    try {
        const response = await (await fetch(BRN_URL)).text();
        const parsed = parse(response, {
            parseNodeValue: true,
            textNodeName: 'value',
            parseAttributeValue: true,
            ignoreAttributes: false,
            attributeNamePrefix: '',
            ignoreNameSpace: true,
        }) as BnrResponse;
        logger.info('Successfully loaded rate data from BNR.');
        return parsed.DataSet.Body;
    } catch (e) {
        logger.error('Unable to load rate data from BNR.', e);
        throw e;
    }
}

const INTERESTING_CURRENCIES = ['USD', 'EUR'];

export async function handler(): Promise<void> {
    const bnr = await callBnr();
    const from = bnr.OrigCurrency;
    const cubes = 'length' in bnr.Cube ? bnr.Cube : [bnr.Cube];
    const rates = cubes.flatMap((cube) =>
        cube.Rate.filter((rate) => INTERESTING_CURRENCIES.includes(rate.currency)).map((rate) =>
            directRate({ Date: cube.date, FromCurrency: from, ToCurrency: rate.currency, Rate: rate.value })
        )
    );
    await new RateRepository().saveDirectRates(rates);
    logger.info(`Successfully saved ${rates.length} rates in the DB.`);
}
