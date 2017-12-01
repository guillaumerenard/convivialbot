import * as builder from "botbuilder";
import BaseDialog from "./basedialog";
import GoogleService from "../google/googleservice";

class GeolocationDialog extends BaseDialog{

    constructor() {
        super();
        this.dialog = [
            (session, args, next) => {
                GoogleService.geolocate().then(geolocateResult => {
                    GoogleService.reverseGeocoding(geolocateResult.location.lat, geolocateResult.location.lng).then(reverseGeocodingResult => {
                        let city = reverseGeocodingResult.address_components.find((addressComponent) => { return addressComponent.types.some(type => { return type === "locality"}) });
                        session.send(`You are in ${city.long_name}`);
                    });
                });
                session.endDialog();
            }
        ];
    }

}

export default GeolocationDialog;
    