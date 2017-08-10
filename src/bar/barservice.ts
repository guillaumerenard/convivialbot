import * as builder from "botbuilder";
import * as https from "https";

class BarService {

    private static host: string = "www.worldsbestbars.com";

    /**
     * Search bars
     * @param city 
     */
    public static searchBars(city: string, atmosphere: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            https.get({
                host: BarService.host,
                path: `/search?entity=Bar&q=*&limit=20&start=0&city=${city}&mood=${atmosphere}&sortby=popularity`,
                headers: {
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                }
            }, response => {
                let body = "";
                response.on("data", data => {
                    body += data;
                });
                response.on("end", () => {
                    resolve(JSON.parse(body));
                });
            });
        });
    }
}

export default BarService;