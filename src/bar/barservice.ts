import * as builder from "botbuilder";
import * as https from "https";

class BarService {

    /**
     * Search bars
     * @param city 
     */
    public static searchBars(city: string, atmosphere: string, withWho: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
        this.getCityGeolocation(city).then(cityGeolocation => {
                https.get({
                    host: process.env.STORE_LOCATOR_API_HOST,
                    path: `${process.env.STORE_LOCATOR_API_PATH}?query=(and%20channel:'ON%20TRADE')(and%20geolocation:'${cityGeolocation.lat},${cityGeolocation.lng},500')`,
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
            }, error => {
                reject(error);
            });
        });
    }

    private static getCityGeolocation(city: string) {
        return new Promise<any>((resolve, reject) => {
            https.get({
                host: "maps.googleapis.com",
                path: `/maps/api/geocode/json?key=${process.env.GOOGLE_MAPS_API_KEY}&address=${city}`
            }, response => {
                let body = "";
                response.on("data", data => {
                    body += data;
                });
                response.on("end", () => {
                    resolve(JSON.parse(body).results[0].geometry.location);
                });
                response.on("error", error => {
                    reject(error);
                });
            });
        });
    }
}

export default BarService;