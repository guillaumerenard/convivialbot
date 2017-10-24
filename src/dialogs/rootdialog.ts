import * as builder from "botbuilder";
import * as https from "https";
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
                        session.send("Attention un ogre !");
                        let handoverRequest = https.request({
                            hostname: "https://graph.facebook.com",
                            path: `/v2.6/me/pass_thread_control?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}&recipient={"id":"${session.message.user.id}"}&target_app_id=263902037430900`,
                            method: "POST"
                        });
                        handoverRequest.on("response", handoverResponse => {
                            session.send("response");
                        });
                        handoverRequest.on("error", handoverError => {
                            session.send(`Error : ${handoverError.message}`);
                        });
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