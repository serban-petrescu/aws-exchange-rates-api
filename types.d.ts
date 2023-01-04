declare module 'lambda-api' {
    export default function api(): {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get: (path: string, handler: (request: any, response: any) => Promise<void>) => void;
        run: () => void;
    };
}

declare module 'fast-xml-parser' {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function parse(body: string, options: object): any;
}
