import * as builder from "botbuilder";
import * as apiai from "apiai";
import RootDialog from "./dialogs/rootdialog";
import GreetingDialog from "./dialogs/greetingdialog";
import SearchBarDialog from "./dialogs/searchbardialog";

class DevBot {

    public connector: builder.ChatConnector;
    private bot: builder.UniversalBot;
    private apiaiApp: apiai.Application;

    public constructor() {
        this.connector = new builder.ChatConnector({
            appId: process.env.MICROSOFT_APP_ID,
            appPassword: process.env.MICROSOFT_APP_PASSWORD
        });
        this.apiaiApp = apiai("4d5fdf0dda3d416f8c8d4ab518b04f27");
        this.bot = new builder.UniversalBot(this.connector);

        // DIalogs
        new RootDialog(this.apiaiApp).register(this.bot, "/");
        new GreetingDialog().register(this.bot, "greeting");
        new SearchBarDialog(this.apiaiApp).register(this.bot, "searchBar");        
    }
}

export default DevBot;