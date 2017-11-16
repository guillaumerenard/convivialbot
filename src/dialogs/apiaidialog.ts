import * as builder from "botbuilder";
import * as apiai from "apiai";
import BaseDialog from "./basedialog";

class ApiAiDialog extends BaseDialog{

    constructor() {
        super();
        this.dialog = [
            (session, args, next) => {
                if(args.fulfillment.messages.length > 0) {
                    let messages = args.fulfillment.messages.filter(message => {
                        return message.platform === "facebook";
                    });
                    if(messages.length === 0) {
                        messages = args.fulfillment.messages;
                    }
                    let responseMessage = new builder.Message(session);
                    let responseMessageAttachments: builder.AttachmentType[] = [];
                    messages.forEach(message => {
                        switch(message.type) {
                            case 0:
                                // Text
                                if(responseMessageAttachments.length > 0) {
                                    session.send(responseMessage);
                                    responseMessage = new builder.Message(session);
                                    responseMessageAttachments = [];
                                }
                                responseMessage.text(message.speech);
                                session.send(responseMessage);
                                responseMessage = new builder.Message(session);
                                break;
                            case 1:
                                // Card
                                responseMessage.attachmentLayout(builder.AttachmentLayout.carousel);
                                let card =  new builder.HeroCard(session)
                                    .title(message.title)
                                    .subtitle(message.subtitle)
                                    .text("")
                                    .images([builder.CardImage.create(session, message.imageUrl)]);
                                let buttons: builder.ICardAction[] = [];
                                message.buttons.forEach(button => {
                                    buttons.push({
                                        type: button.postback ? "openUrl" : "postBack",
                                        title: button.text,
                                        text: button.text,
                                        diplayText: button.text,
                                        value: button.postback || button.text
                                    });
                                });
                                card.buttons(buttons)
                                responseMessageAttachments.push(card);
                                responseMessage.attachments(responseMessageAttachments);
                                break;
                            case 2:
                                // Quick replies
                                if(responseMessageAttachments.length > 0) {
                                    session.send(responseMessage);
                                    responseMessage = new builder.Message(session);
                                    responseMessageAttachments = [];
                                }
                                responseMessage.text(message.title);
                                responseMessage.attachmentLayout(builder.AttachmentLayout.list);
                                let quickRepliesCard =  new builder.HeroCard(session);
                                let quickRepliesButtons: builder.ICardAction[] = [];
                                message.replies.forEach(replie => {
                                    quickRepliesButtons.push({
                                        type: "postBack",
                                        title: replie,
                                        text: replie,
                                        diplayText: replie,
                                        value: replie
                                    });
                                });
                                quickRepliesCard.buttons(quickRepliesButtons);
                                responseMessageAttachments.push(quickRepliesCard);
                                responseMessage.attachments(responseMessageAttachments);
                                break;
                            case 3:
                                // Image
                                responseMessage.attachmentLayout(builder.AttachmentLayout.carousel);
                                responseMessageAttachments.push(new builder.HeroCard(session)
                                    .images([builder.CardImage.create(session, message.imageUrl)]));
                                responseMessage.attachments(responseMessageAttachments);
                                break;
                            default:
                                break;
                        }
                    });
                    if(responseMessageAttachments.length > 0) {
                        session.send(responseMessage);
                    }
                }
                session.endDialog();
            }
        ]
    }
}

export default ApiAiDialog;