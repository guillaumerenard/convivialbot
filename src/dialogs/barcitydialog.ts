import * as builder from "botbuilder";
import BaseDialog from "./basedialog";

class BarCityDialog extends BaseDialog{

    constructor() {
        super();
        this.dialog = new builder.IntentDialog();
        this.dialog.onBegin((session, args, next) => {
            let cityMessage = new builder.Message(session).text("In which city are you looking for a bar ?");
            cityMessage.sourceEvent({
                facebook: {
                    quick_replies: [{
                        content_type: "location"
                    }]
                }
            });
            session.send(cityMessage);
        });
        this.dialog.onDefault(session => {
            if (session.message.sourceEvent.message && session.message.sourceEvent.message.attachments) {
                var attachment = session.message.sourceEvent.message.attachments[0];
                if (attachment.type == 'location') {
                    session.endDialogWithResult({ response: { entity: {
                        title: attachment.title,
                        coordinates: attachment.payload.coordinates
                    }}});
                }
            } else {
                session.endDialogWithResult({response: session.message.text});
            }
        });
    }
    
}

export default BarCityDialog;