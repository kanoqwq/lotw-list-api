import { fetchData } from "../utils/fetch";
export async function logout() {
    const res = await fetchData({ url: "https://lotw.arrl.org/lotwuser/default?logout=1" })
    const textRes = res && await res.text()
    if (textRes) {
        console.log('logout success');
    }
}