import * as builder from "botbuilder";
import BarService from "../bar/barservice";
import BaseDialog from "./basedialog";

class SearchBarDialog extends BaseDialog{

    constructor() {
        super();
        this.dialog = [
            (session, args, next) => {
                session.dialogData.barLocation = args.parameters['geo-city'];
                session.dialogData.barAtmosphere = args.parameters.BarAtmosphere;
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
                if(session.dialogData.barAtmosphere !== "") {
                    next();
                }
                else {
                    builder.Prompts.choice(session, "What kind of atmosphere do you want ?", ["Casual", "Chill Out", "Classic", "Intimate", "Party", "Sophisticated"]);
                }
            },
            (session, results) => {
                session.dialogData.barAtmosphere = results.response.entity;
                session.send(`I am looking for you to bar in ${session.dialogData.barLocation} matching your criteria`);
                BarService.searchBars(session.dialogData.barLocation, session.dialogData.barAtmosphere).then(searchResults => {
                    session.send(`I found ${searchResults.hits.found} matching your request`);
                    if(searchResults.hits.hit.length > 0) {
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
                    }
                });
            }
        ]
    }
}

export default SearchBarDialog;