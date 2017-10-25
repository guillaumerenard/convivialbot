import * as builder from "botbuilder";
import BaseDialog from "./basedialog";

class BarCityDialog extends BaseDialog{

    constructor() {
        super();
        this.dialog = [
            (session, args, next) => {
                if(session.message.source === "facebook") {
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
            },
            (session, results, next) => {
                if (session.message.sourceEvent.message && session.message.sourceEvent.message.attachments) {
                    var attachment = session.message.sourceEvent.message.attachments[0];
                    if (attachment.type == 'location') {
                        session.endDialogWithResult({ response: { entity: {
                            title: attachment.title,
                            coordinates: attachment.payload.coordinates
                        }}})
                    }
                } else {
                    session.endDialogWithResult({response: results.response});
                }
            }
        ];
    }
    
}

export default BarCityDialog;