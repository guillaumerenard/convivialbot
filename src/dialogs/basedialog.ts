import * as builder from "botbuilder";

abstract class BaseDialog {

    protected dialog: builder.IDialogWaterfallStep[] | builder.IDialogWaterfallStep;

    /**
     * Register dialog to bot
     * @param bot 
     * @param path 
     */
    public register(bot: builder.UniversalBot, path: string): void {
        bot.dialog(path, this.dialog);
    }

}

export default BaseDialog;