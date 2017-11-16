import * as builder from "botbuilder";
import * as apiai from "apiai";
import { Handoff } from "./handoff";
import { commandsMiddleware } from "./commands";
import RootDialog from "./dialogs/rootdialog";
import GreetingDialog from "./dialogs/greetingdialog";
import BarCityDialog from "./dialogs/barcitydialog";
import SearchBarDialog from "./dialogs/searchbardialog";
import ApiAiDialog from "./dialogs/apiaidialog";
import FacebookHandoverDialog from "./dialogs/facebookhandoverdialog";

class ConvivialBot {

    public connector: builder.ChatConnector;
    private bot: builder.UniversalBot;
    private apiaiApp: apiai.Application;

    public constructor() {
        this.connector = new builder.ChatConnector({
            appId: process.env.MICROSOFT_APP_ID,
            appPassword: process.env.MICROSOFT_APP_PASSWORD
        });
        this.apiaiApp = apiai(process.env.APIAI_TOKEN);
        this.bot = new builder.UniversalBot(this.connector);

        // Middleware
        const handoff = new Handoff(this.bot, (session: builder.Session) => session.userData.isAgent);
        this.bot.use(
            {
                botbuilder: (session: builder.Session, next: Function) => {
                    session.sendTyping();
                    next();
                }
            },
            commandsMiddleware(handoff),
            handoff.routingMiddleware()
        );

        // Recognizer
        //this.bot.recognizer(new builder.LuisRecognizer(`https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/93df406e-d5fc-4339-8435-4323a6463365?subscription-key=387ce3fb12fe4f7095747936830250bf&timezoneOffset=1.0&q=`));

        // Dialogs
        new RootDialog(this.apiaiApp).register(this.bot, "/");
        new GreetingDialog().register(this.bot, "greeting");
        new BarCityDialog().register(this.bot, "barCity");
        new SearchBarDialog(this.apiaiApp).register(this.bot, "searchBar", {
            matches: "SearchBar"
        });
        new ApiAiDialog().register(this.bot, "apiAi");
        new FacebookHandoverDialog().register(this.bot, "facebookHandover");
    }
}

export default ConvivialBot;