import * as builder from "botbuilder";
import * as https from "https";

class BarService {

    private static host: string = "www.worldsbestbars.com";

    /**
     * Search bars
     * @param city 
     */
    public static searchBars(city: string, atmosphere: string, withWho: string): Promise<any> {
        let query: string  = "";
        query = `&city=${city}`;
        if(atmosphere !== "") {
            query += `&mood=${atmosphere}`;
        }
        if(withWho !== "") {
            query += `&occasion=${withWho}`;
        }
        return new Promise<any>((resolve, reject) => {
            https.get({
                host: BarService.host,
                path: `/search?entity=Bar&q=*&limit=10&start=0${query}&sortby=popularity`,
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