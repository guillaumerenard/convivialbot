import * as builder from "botbuilder";
import * as apiai from "apiai";
import BaseDialog from "./basedialog";

class ApiAiDialog extends BaseDialog{

    constructor() {
        super();
        this.dialog = [
            (session, args, next) => {
                if(args.fulfillment.messages.length > 0) {
                    let apiAiMessage = args.fulfillment.messages[0];
                    switch(apiAiMessage.type) {
                        case 0:
                            session.send(apiAiMessage.speech);
                            break;
                        case 1:
                            let message = new builder.Message(session);
                            message.attachmentLayout(builder.AttachmentLayout.carousel);
                            let messageAttachments: builder.AttachmentType[] = [];
                            messageAttachments.push(new builder.HeroCard(session)
                                .title(apiAiMessage.title)
                                .subtitle(apiAiMessage.subtitle)
                                .text("")
                                .images([builder.CardImage.create(session, apiAiMessage.imageUrl)]));
                            message.attachments(messageAttachments);
                            session.send(message);
                            break;
                        default:
                            break;
                    }
                }
                session.endDialog();
            }
        ]
    }
}

export default ApiAiDialog;