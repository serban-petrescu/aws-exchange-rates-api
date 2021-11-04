import axios from 'axios';
import { parse } from 'fast-xml-parser';
import { directRate, RateRepository } from './rate-repository';

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
    const response = (await (await axios.get(BRN_URL, { responseType: 'text' })).data) as string;
    const parsed = parse(response, {
        parseNodeValue: true,
        textNodeName: 'value',
        parseAttributeValue: true,
        ignoreAttributes: false,
        attributeNamePrefix: '',
        ignoreNameSpace: true,
    }) as BnrResponse;
    return parsed.DataSet.Body;
}

const INTERESTING_CURRENCIES = ['USD', 'EUR'];

export async function handler(): Promise<void> {
    const bnr = await callBnr();
    const from = bnr.OrigCurrency;
    const cubes = 'length' in bnr.Cube ? bnr.Cube : [bnr.Cube];
    await new RateRepository().saveDirectRates(
        cubes.flatMap((cube) =>
            cube.Rate.filter((rate) => INTERESTING_CURRENCIES.includes(rate.currency)).map((rate) =>
                directRate({ Date: cube.date, FromCurrency: from, ToCurrency: rate.currency, Rate: rate.value })
            )
        )
    );
}
