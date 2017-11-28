import * as https from "https";

class GoogleService {

    public static geocoding(address: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            https.get({
                host: "maps.googleapis.com",
                path: `/maps/api/geocode/json?key=${process.env.GOOGLE_MAPS_API_KEY}&address=${address.replace(/ /g, "%20")}`
            }, response => {
                let body = "";
                response.on("data", data => {
                    body += data;
                });
                response.on("end", () => {
                    resolve(JSON.parse(body).results[0]);
                });
                response.on("error", error => {
                    reject(error);
                });
            });
        });
    }

    public static reverseGeocoding(latitude: string, longitude: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            https.get({
                host: "maps.googleapis.com",
                path: `/maps/api/geocode/json?key=${process.env.GOOGLE_MAPS_API_KEY}&latlng=${latitude},${longitude}`
            }, response => {
                let body = "";
                response.on("data", data => {
                    body += data;
                });
                response.on("end", () => {
                    resolve(JSON.parse(body).results[0]);
                });
                response.on("error", error => {
                    reject(error);
                });
            });
        });
    }

    public static geolocate() {
        return new Promise<any>((resolve, reject) => {
            https.get({
                host: "www.googleapis.com",
                path: `/geolocation/v1/geolocate?key=${process.env.GOOGLE_MAPS_API_KEY}`,
                method: "POST"
            }, response => {
                let body = "";
                response.on("data", data => {
                    body += data;
                });
                response.on("end", () => {
                    resolve(JSON.parse(body));
                });
                response.on("error", error => {
                    reject(error);
                });
            });
        });
    }

}

export default GoogleService;