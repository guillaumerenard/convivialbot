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
                    builder.Prompts.text(session, "In which city are you looking for a bar?");
                }
            },
            (session, results, next) => {
                if(results.response) {
                    session.dialogData.barLocation = results.response;
                }
                session.send(`I am looking for you to bar in ${session.dialogData.barLocation} matching your criteria`);
                BarService.searchBars(session.dialogData.barLocation, session.dialogData.barAtmosphere, session.dialogData.barWithWho).then(searchResults => {
                    if(searchResults.hits.hit.length > 0) {
                        session.send(`I found ${searchResults.hits.found} bars matching your request`);                 
                        session.send("Here are the most popular");
                        let bestResultMessage = new builder.Message(session);
                        bestResultMessage.attachmentLayout(builder.AttachmentLayout.carousel);
                        let bestResultAttachments: builder.AttachmentType[] = [];
                        for(let i:number=0; i < searchResults.hits.hit.length && i < 5; i++) {
                            bestResultAttachments.push(new builder.HeroCard(session)
                                .title(searchResults.hits.hit[i].fields.name)
                                .subtitle(searchResults.hits.hit[i].fields.address)
                                .text(searchResults.hits.hit[i].fields.description)
                                .images([builder.CardImage.create(session, searchResults.hits.hit[i].fields.wbb_media_url)]));
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
        console.log(args);
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
        session.dialogData.contexts = args.contexts;
        console.log(session.dialogData);
        console.log(session.dialogData.contexts);
    }
}

export default SearchBarDialog;