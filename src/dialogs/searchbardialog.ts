import * as builder from "botbuilder";
import * as apiai from "apiai";
import BarService from "../bar/barservice";
import BaseDialog from "./basedialog";

class SearchBarDialog extends BaseDialog{

    constructor(apiaiApp: apiai.Application) {
        super();
        this.dialog = [
            (session, args, next) => {
                this.initDialog(session, args);
                if(session.dialogData.barLocation !== "") {
                    next();
                }
                else {
                    if(session.message.source == "facebook") {
                        let cityMessage = new builder.Message(session).text("In which city are you looking for a bar ?")
                            .sourceEvent({
                                facebook: {
                                    quick_replies: [{
                                        content_type: "location"
                                    }]
                                }
                            });
                        session.send(cityMessage);
                    }
                    else {
                        builder.Prompts.text(session, "In which city are you looking for a bar ?");
                    }
                }
            },
            (session, results, next) => {
                if(session.dialogData.barLocation !== "") {
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
                if(results.response) {
                    session.dialogData.barLocation = results.response;
                }
                session.send(`I am looking for you to bar in ${session.dialogData.barLocation} matching your criteria`);
                session.sendTyping();
                BarService.searchBars(session.dialogData.barLocation, session.dialogData.barAtmosphere, session.dialogData.barWithWho).then(searchResults => {
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
    private initDialog(session: builder.Session, args: any): void {
        if(args.metadata.intentName === "AddSearchBarCriteria") {
            args.parameters.BarCity !== "" ? session.dialogData.barLocation = args.parameters.BarCity : session.dialogData.barLocation = args.parameters.ContextBarCity;
            args.parameters.BarAtmosphere !== "" ? session.dialogData.barAtmosphere = args.parameters.BarAtmosphere : session.dialogData.barAtmosphere = args.parameters.ContextBarAtmosphere;
            args.parameters.BarWithWho !== "" ? session.dialogData.barWithWho = args.parameters.BarWithWho : session.dialogData.barWithWho = args.parameters.ContextBarAtmosphere;
        }
        else {
            session.dialogData.barLocation = args.parameters.BarCity;
            session.dialogData.barAtmosphere = args.parameters.BarAtmosphere;
            session.dialogData.barWithWho = args.parameters.BarWithWho;
        }
        session.dialogData.result = args;
        session.dialogData.contexts = args.contexts;
    }
}

export default SearchBarDialog;