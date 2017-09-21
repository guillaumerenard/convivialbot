import * as builder from "botbuilder";
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