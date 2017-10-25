import * as builder from "botbuilder";
import * as https from "https";

class BarService {

    /**
     * Search bars
     */
    public static searchBars(latitude: string, longitude: string, atmosphere: string, withWho: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            https.get({
                host: process.env.STORE_LOCATOR_API_HOST,
                path: `${process.env.STORE_LOCATOR_API_PATH}?query=(and%20channel:'ON%20TRADE')(and%20geolocation:'${latitude},${longitude},300')`,
                headers: {
                    "Content-Type": "application/json",
                    "api_key": process.env.STORE_LOCATOR_API_KEY
                }
            }, response => {
                let body = "";
                response.on("data", data => {
                    body += data;
                });
                response.on("end", () => {
                    if(body) {
                        resolve(JSON.parse(body));
                    }
                    else {
                        resolve(null);
                    } 
                });
                response.on("error", error => {
                    reject(error);
                });
            });
        });
    }
}

export default BarService;