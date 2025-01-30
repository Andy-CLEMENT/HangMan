//On implente les requires
const url=require("url");
const path=require("path");
const fs=require("fs");

//On initialise les constantes
const frontPath="./front"; //contient le chemin vers le dossier front
const mimeTypes = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.md': 'text/plain',
    'default': 'application/octet-stream'
};

//Constante pour redirection par défaut (bonus TD1).
const defaultPage="index.html";

function manageRequest(request, response) {
    response.statusCode = 200;
    let pathname= frontPath + url.parse(request.url).pathname; // Variable contenant le chemin d'accès jusqu'à la page demandé
    try{
        fs.statSync(pathname);// On vérifie l'existence du fichier
        
        //---------BONUS-------- Redicrection par défaut 
        if( fs.statSync(pathname).isDirectory()){
            pathname=pathname+"/"+defaultPage;
        }
        //--------------FIN BONUS------------------

        //Lecture du fichier
        fs.readFile(pathname,function(error, data){
            if(error){
                console.log(error);
            }else{
                response.header= new Headers({"Content-type": mimeTypes[path.parse(request.url).ext],});
                response.end(data);
            }
        });
    }
    catch(error){
        response.statusCode=404;

        //---------BONUS--------Redirection vers page HTML erreur 404
        fs.readFile(frontPath+"/404.html",function(error, data){
            if(error){
                console.log(error);
            }else{
                response.header= new Headers({"Content-type": mimeTypes['.html'],});
                response.end(data);
            }
        });
        //---------FIN BONUS--------Redirection vers page HTML erreur 404
    }
}

//Export de la fonction manageRequest
exports.manage = manageRequest; 
