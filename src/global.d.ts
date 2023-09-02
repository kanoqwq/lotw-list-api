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

interface DetailsData {
    callSign: string
    cqZone: string
    ITUZone: string
    grid: string
    myGrid: string
    satellite: string
    province: string
    myProvince: string
}

interface ADIJsonRecord {
    BAND?: string,
    BAND_RX?: string,
    CALL?: string,
    COUNTRY?: string,
    CQZ?: string,
    DXCC?: string,
    FREQ?: string,
    FREQ_RX?: string,
    GRIDSQUARE?: string,
    ITUZ?: string,
    MODE?: string,
    MY_COUNTRY?: string,
    MY_CQ_ZONE?: string,
    MY_DXCC?: string,
    MY_GRIDSQUARE?: string,
    MY_ITU_ZONE?: string,
    MY_STATE?: string,
    PROP_MODE?: string,
    QSLRDATE?: string,
    QSL_RCVD?: string,
    QSO_DATE?: string,
    SAT_NAME?: string,
    STATE?: string,
    STATION_CALLSIGN?: string,
    TIME_ON?: string
}