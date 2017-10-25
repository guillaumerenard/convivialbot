import * as builder from "botbuilder";
import BaseDialog from "./basedialog";

class BarCityDialog extends BaseDialog{

    constructor() {
        super();
        this.dialog = [
            (session, args, next) => {
                let cityMessage = new builder.Message(session).text("In which city are you looking for a bar ?")
                .sourceEvent({
                    facebook: {
                        quick_replies: [{
                            content_type: "location"
                        }]
                    }
                });
                builder.Prompts.text(session, cityMessage);
                //session.send(cityMessage);
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