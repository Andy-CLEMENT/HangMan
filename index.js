//On implente les requires
const api= require("./api"); //require pour fichier api.js
const files= require("./files"); //require pour fichier files.js
const http= require("http"); //require pour http


//On créer le à l'aide de http serveur
http.createServer(function(request,response){

    //On accède à la boucle si on a api dans l'url
    if(request.url.split("/")[1]=="api"){
        api.manage(request,response);
    }
    else{
        files.manage(request,response);
    }
}).listen(8000);