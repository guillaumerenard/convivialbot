import * as builder from "botbuilder";
import * as http from "http";
import * as apiai from "apiai";
import BaseDialog from "./basedialog";

class RootDialog extends BaseDialog{

    constructor(apiaiApp: apiai.Application) {
        super();
        this.dialog = [
            (session, args, next) => {
                if(args && args.reprompt) {
                    next( {response: {reprompt:true}} );
                }
                else {
                    session.beginDialog("greeting");
                }
            },
            (session, results, next) => {
                if(results.response && results.response.reprompt) {
                    builder.Prompts.text(session, "Can I do something else for you ?");
                }
                else {
                    builder.Prompts.text(session, "How can I help you today ?");
                }
            },
            (session, results, next) => {
                let request = apiaiApp.textRequest(results.response, {
                    sessionId: `${Math.random()}`
                });
                request.on("response", response => {
                    if(response.result.metadata.intentName === "SearchBar") {
                        session.beginDialog("searchBar", response.result);
                    }
                    else if(response.result.metadata.intentName === "Agent") {
                        session.userData.isAgent === null ? session.userData.isAgent = true : session.userData.isAgent = !session.userData.isAgent;
                        session.userData.isAgent ? session.send("You are an agent !") : session.send("You are not an agent !");
                        next();
                    }
                    else if(response.result.metadata.intentName === "Handover") {
                        session.send(`Ton ID : ${session.message.user.id}`);
                        http.request("https://graph.facebook.com/v2.6/me/pass_thread_control?access_token=<PAGE_ACCESS_TOKEN>")
                        let handoverMessage = new builder.Message(session).text("Facebook handover");
                        handoverMessage.sourceEvent({
                            Facebook: {
                                sender:{
                                    id: session.message.user.id
                                  },
                                  recipient:{
                                    id:140061593257238
                                  },
                                  timestamp:Date.now(),
                                  pass_thread_control:{
                                    new_owner_app_id:263902037430900,
                                    metadata:"Et hop !"
                                  }
                            }
                        });
                        session.send(handoverMessage);
                        next();
                    }
                    else {
                        session.beginDialog("apiAi", response.result);
                    }
                });
                request.on("error", error => {
                    session.endDialog("Outch !");
                });
                request.end();
            },
            (session, results, next) => {
                session.replaceDialog("/", { reprompt: true });
            }
        ];
    }
    
}

export default RootDialog;