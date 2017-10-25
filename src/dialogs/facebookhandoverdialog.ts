import * as builder from "botbuilder";
import * as https from "https";
import BaseDialog from "./basedialog";

class FacebookHandoverDialog extends BaseDialog{

    constructor() {
        super();
        this.dialog = [
            (session, args, next) => {
                let handoverParameters = {
                    recipient: {
                        id: `${session.message.user.id}`
                    },
                    target_app_id: 263902037430900
                };
                let handoverBody = JSON.stringify(handoverParameters);
                let handoverRequest = https.request({
                    hostname: "graph.facebook.com",
                    path: `/v2.6/me/pass_thread_control?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": handoverBody.length
                    },
                    port: 443
                }, message => {
                    message.on("data", handoverChunk => {
                        session.send("Facebook handover !");
                        session.endDialog();
                    });
                });
                handoverRequest.on("error", handoverError => {
                    session.send(`Facebook handover error : ${handoverError.message}`);
                    session.endDialog();
                });
                handoverRequest.write(handoverBody);
                handoverRequest.end();
                session.sendTyping();
            }
        ];
    }

}

export default FacebookHandoverDialog;