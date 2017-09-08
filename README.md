# convivial bot
A sample bot with Bot Framework

##Testing locally
* git clone this repo.
* npm install
* node ./build/server.js
* Visit [http://localhost:3978/](http://localhost:3978/) to see the home page.
* Use **http://localhost:3978/api/messages** in the [Bot Framework Emulator](http://docs.botframework.com/connector/tools/bot-framework-emulator/#navtitle)
   
##Helpful hints:
* Your web app will deploy whenever you git push to your repo. Changing the text of your index.html and visiting your homepage is a simple way to see that your latest deployment has been published to Azure.
* Azure "knows" your app is a NodeJs app by the presence of the "server.js" file. Renaming this file may possibly cause Azure to not execute NodeJs code.
* Azure app settings become NodeJS process.env variables.
* Use https when specifying URLs in the Bot Framework developer portal. Your app secret will not be transmitted unless it is secure.
