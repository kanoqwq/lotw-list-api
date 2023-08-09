interface LoginData {
    login: string | undefined;
    password: string | undefined;
    thisForm?: string | undefined;
    [key: string]: any;
}

interface Headers {
    getSetCookie: () => Array<string>
}

interface DataFetchParams {
    url: string;
    method?: string;
    headers?: any;
    body?: any;
}

interface ResultData {
    callsign: string;
    worked: string;
    datetime: string;
    band: string;
    mode: string;
    freq: string;
    QSL: string | undefined;
    [key: string]: any;
}