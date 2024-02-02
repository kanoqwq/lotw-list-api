export async function fetchData({ url, method = 'get', headers, body }: DataFetchParams) {
    try {
        console.log(url,method,headers,body);
        const res = await fetch(url, {
            method,
            headers,
            body: body ? body : null
        })
        if (res.ok) {
            return res
        } else {
            throw new Error(await res.text())
        }
    } catch (e: any) {
        console.log(e.message);
        throw e
    }
}