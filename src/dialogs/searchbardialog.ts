import * as builder from "botbuilder";
import * as apiai from "apiai";
import BarService from "../bar/barservice";
import GoogleService from "../google/googleservice";
import BaseDialog from "./basedialog";

class SearchBarDialog extends BaseDialog{

    constructor(apiaiApp: apiai.Application) {
        super();
        this.dialog = [
            (session, args, next) => {
                session.dialogData.initPromise = this.initDialog(session, args);
                if(session.dialogData.barCity !== "") {
                    next();
                }
                else {
                    session.beginDialog("barCity");
                }
            },
            (session, results, next) => {
                if(session.dialogData.barCity !== "") {
                    next();
                }
                else if(results.response.entity) {
                    session.dialogData.barLatitude = results.response.entity.coordinates.lat;
                    session.dialogData.barLongitude = results.response.entity.coordinates.long;
                    next();
                }
                else {
                    let request = apiaiApp.textRequest(results.response, {
                        sessionId: `${Math.random()}`,
                        contexts: session.dialogData.contexts
                    });
                    request.on("response", response => {
                        if(response.result.metadata.intentName === "SearchBar" || response.result.metadata.intentName === "AddSearchBarCriteria") {
                            session.replaceDialog("searchBar", response.result);
                        }
                        else {
                            session.send("Sorry, I do not know this city");
                            session.replaceDialog("searchBar", session.dialogData.result);
                        }
                    });
                    request.on("error", error => {
                        session.endDialog("Outch !");
                    });
                    request.end();
                }
            },
            (session, results, next) => {
                session.send(`I am looking for you to bar in ${session.dialogData.barCity} matching your criteria`);
                session.send(`${session.dialogData.barLatitude} ${session.dialogData.barLongitude}`);
                session.sendTyping();
                session.dialogData.initPromise.then(() => {
                    session.send(`${session.dialogData.barLatitude} ${session.dialogData.barLongitude}`);
                    BarService.searchBars(session.dialogData.barLatitude, session.dialogData.barLongitude, session.dialogData.barAtmosphere, session.dialogData.barWithWho).then(searchResults => {
                        if(searchResults && searchResults.status.foundOutlets > 0) {
                            session.send(`I found ${searchResults.status.foundOutlets} bars matching your request`);
                            session.send("Here are the most popular");
                            let bestResultMessage = new builder.Message(session);
                            bestResultMessage.attachmentLayout(builder.AttachmentLayout.carousel);
                            let bestResultAttachments: builder.AttachmentType[] = [];
                            for(let i:number=0; i < searchResults.status.foundOutlets && i < 5; i++) {
                                bestResultAttachments.push(new builder.HeroCard(session)
                                    .title(searchResults.outlets[i].name)
                                    .subtitle(`${searchResults.outlets[i].address.street} ${searchResults.outlets[i].address.postalCode} ${searchResults.outlets[i].address.city}`)
                                    .text(`${searchResults.outlets[i].type} phone: ${searchResults.outlets[i].contact.phone}`)
                                    .images([builder.CardImage.create(session, "https://www.scandichotels.com/imagevault/publishedmedia/suw58cmdyrxfvvjep2a5/Scandic-Malmen-Interior-bar-Lilla-hotellbaren-over.jpg")]));
                            }
                            bestResultMessage.attachments(bestResultAttachments);
                            session.send(bestResultMessage);
                            builder.Prompts.text(session, "Do you have other criteria for your search ?");
                        }
                        else {
                            session.send("Sorry, I did not find any bar that matches your criteria");
                            session.endDialog();
                        }
                    });
                }, reason => {
                    session.endDialog(reason);
                });
            },
            (session, results, next) => {
                let request = apiaiApp.textRequest(results.response, {
                    sessionId: `${Math.random()}`,
                    contexts: session.dialogData.contexts
                });
                request.on("response", response => {
                    if(response.result.metadata.intentName === "SearchBar" || response.result.metadata.intentName === "AddSearchBarCriteria") {
                        session.replaceDialog("searchBar", response.result);
                    }
                    else {
                        session.endDialog();
                    }
                });
                request.on("error", error => {
                    session.endDialog("Outch !");
                });
                request.end();
            }
        ]
    }

    /**
     * Initialize dialogue with api.ai response result
     * @param session 
     * @param args 
     */
    private initDialog(session: builder.Session, args: any): Promise<null> {
        return new Promise<null>((resolve, reject) => {
            session.send("Start init");
            if(args) {
                session.send("avec args");
                if(args.metadata.intentName === "AddSearchBarCriteria") {
                    args.parameters.BarCity !== "" ? session.dialogData.barCity = args.parameters.BarCity : session.dialogData.barCity = args.parameters.ContextBarCity;
                    args.parameters.BarAtmosphere !== "" ? session.dialogData.barAtmosphere = args.parameters.BarAtmosphere : session.dialogData.barAtmosphere = args.parameters.ContextBarAtmosphere;
                    args.parameters.BarWithWho !== "" ? session.dialogData.barWithWho = args.parameters.BarWithWho : session.dialogData.barWithWho = args.parameters.ContextBarAtmosphere;
                }
                else {
                    session.dialogData.barCity = args.parameters.BarCity;
                    session.dialogData.barAtmosphere = args.parameters.BarAtmosphere;
                    session.dialogData.barWithWho = args.parameters.BarWithWho;
                }
                session.send("end get data");
                session.dialogData.result = args;
                session.dialogData.contexts = args.contexts;
                session.send(session.dialogData.barCity);
                if(session.dialogData.barCity) {
                    session.send("geocoding");
                    GoogleService.geocoding(session.dialogData.barCity).then(result => {
                        session.dialogData.barLatitude = result.geometry.location.lat;
                        session.dialogData.barLongitude = result.geometry.location.lng;
                        resolve();
                    }, reason => {
                        reject(reason);
                    });
                }
                else {
                    resolve();
                }
            }
            else {
                resolve();
            }
        });
    }
}

export default SearchBarDialog;