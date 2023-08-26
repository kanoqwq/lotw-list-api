export async function fetchData({ url, method = 'get', headers, body }: DataFetchParams) {
    try {
        const res = await fetch(url, {
            method,
            headers,
            body: body ? body : null
        })
        if (res.ok) {
            return res
        } else {
            throw new Error('请求失败')
        }
    } catch (e: any) {
        console.log(e.message);
        throw e
    }
}