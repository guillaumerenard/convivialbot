import * as builder from "botbuilder";
import * as apiai from "apiai";
import BaseDialog from "./basedialog";

class GreetingDialog extends BaseDialog{

    constructor(apiaiApp: apiai.Application) {
        super();
        this.dialog = [
            (session, args, next) => {
                builder.Prompts.text(session, "Hello, how should I call you ?");
            },
            (session, results) => {
                session.send(`Welcome ${results.response}`);
                builder.Prompts.text(session, "How can I help you today ?");
            },
            (session, results) => {
                let request = apiaiApp.textRequest(results.response, {
                    sessionId: `${Math.random()}`
                });
                request.on("response", response => {
                    if(response.result.metadata.intentName === "SearchBar") {
                        session.beginDialog("searchBar", response.result);
                    }
                });
                request.on("error", error => {
                    console.log(error);
                });
                request.end();
            },
        ]
    }
    
}

export default GreetingDialog;