import * as builder from "botbuilder";
import * as apiai from "apiai";
import BaseDialog from "./basedialog";

class GreetingDialog extends BaseDialog{

    constructor() {
        super();
        this.dialog = [
            (session, args, next) => {
                if(session.userData.name) {
                    next();
                }
                else {
                    builder.Prompts.text(session, "Hello, how should I call you ?");
                }
            },
            (session, results, next) => {
                if(results.response) {
                    session.userData.name = results.response;
                }
                session.endDialog(`Welcome ${session.userData.name}`);
            }
        ];
    }
    
}

export default GreetingDialog;