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
                    let responseMessage = new builder.Message(session);
                    let responseMessageAttachments: builder.AttachmentType[] = [];
                    switch(apiAiMessage.type) {
                        case 0:
                            responseMessage.text(apiAiMessage.speech);
                            break;
                        case 1:
                            responseMessage.attachmentLayout(builder.AttachmentLayout.carousel);
                            responseMessageAttachments.push(new builder.HeroCard(session)
                                .title(apiAiMessage.title)
                                .subtitle(apiAiMessage.subtitle)
                                .text("")
                                .images([builder.CardImage.create(session, apiAiMessage.imageUrl)]));
                            responseMessage.attachments(responseMessageAttachments);
                            break;
                        case 3:
                            responseMessageAttachments.push(new builder.HeroCard(session)
                                .images([builder.CardImage.create(session, apiAiMessage.imageUrl)]));
                            responseMessage.attachments(responseMessageAttachments);
                            break;
                        default:
                            break;
                    }
                    session.send(responseMessage);
                }
                session.endDialog();
            }
        ]
    }
}

export default ApiAiDialog;