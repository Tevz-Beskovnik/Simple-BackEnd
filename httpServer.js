const fs = require('fs');

class HttpServer{
    constructor(req, res, ip, whitelistDir, otherReqDir, POSTurlFuncs, GETurlExc){
        this.whitelistDir = whitelistDir;
        //ˇˇˇˇ for GET requests for images ext. comming from the html page
        this.GETurlExc = GETurlExc || '';
        this.otherReqDir = otherReqDir;
        this.POSTurlFuncs = POSTurlFuncs;
        this.req = req;
        this.res = res;
        this.ip = ip || '127.0.0.1';
        this.method = req.method;
        this.url = req.url;
        this.cookie = req.headers.cookie;
    }

    //returns error 404 page the argument takes in the file location
    error404page(page){
        this.res.writeHeader(404, {'Content-Type': 'text/html'});
        fs.createReadStream(page).pipe(this.res);
    }
    
    //returnPage function returns any existing html file if it is named the same as the url
    //GETurlExc is ment for exceptions if you do not want to return the direct page to the url like redirecting etc...
    //if you add a ? to the end of the object property it will run when there is extra data on the end of that url
    /*
        example:
        let GETurlExc = {
            '/chat': function(req, res){
                //function
            },
            note that ˇˇ this one runs only when there is aditional data in the url
            '/chat?': function(req, res, getReqData){
                //function
            }
        }
    */
    //(keep in mind that the url will be /file and the html file will be named file.html)
    returnPage(){
        if(this.req){
            let getReqArgs = this.url.split('?');
            let reqType = this.url.split('.').length;
            if(this.method != 'GET') return this
            fs.lstat(this.whitelistDir, (err, lstat) => {
                if(err) return console.error(err);
                if(!lstat.isDirectory()) return console.error("whitelistDir is not a directory!");
            });
            fs.readdir(this.whitelistDir, (err, files) => {
                if(err) return console.error(err);
                if(getReqArgs[0]+'?' in this.GETurlExc){
                    this.GETurlExc[getReqArgs[0]+'?'](this.req, this.res, getReqArgs[1]);
                }else if(this.GETurlExc != '' &&  this.url in this.GETurlExc){
                    this.GETurlExc[this.url](this.req, this.res);
                }else if(files.includes(this.url.replace('/', '')+'.html')){
                    let file = files[files.indexOf(this.url.replace('/', '')+'.html')];   
                    this.res.writeHeader(200, {'Content-Type': 'text/html'});
                    fs.createReadStream(this.whitelistDir+"/"+file).pipe(this.res);
                }else if(reqType == 1){
                    this.error404page('./html/404.html');
                }
            });
            return this;
        }
    }

    /* 
        the returnFile function returnes any file such as .css, .ico, .png, .jpg, .js
        if it is stored in the other folder in the whitelist folder otherwise it will return nothing 
    */
    returnFile(){
        if(this.req){
            if(this.req.headers.referer == undefined) return this;
            let reqUrl = this.url.split(".").slice(-1);
            let exts = ["js", "png", "jpg", "css", "ico"];
            let contentType = ['text/javascript', 'image/png', 'image/jpg', "text/css", 'image/x-icon'];
            let headerConType = contentType[exts.indexOf(reqUrl[0])];
            let cutUrl = this.url.split("/");
            let referIp = this.req.headers.referer.split('/');
            if(!this.method == 'GET') return this;
            if(referIp.indexOf(this.ip) == -1) return this;
            fs.lstat(this.otherReqDir, (err, lstat) => {
                if(err) return console.error(err);
                if(!lstat.isDirectory()) return console.error("whitelistDir is not a directory!");
            });
            fs.readdir(this.otherReqDir, (err, files) => {
                if(err) return console.error(err);
                if(!files.includes(cutUrl[cutUrl.length-1])) return this;
                let file = files[files.indexOf(cutUrl[cutUrl.length-1])];
                this.res.writeHeader(200, {'Content-Type': headerConType});
                fs.createReadStream(this.otherReqDir+'/'+file).pipe(this.res);
            });
            return this;
        }
    }

    //this is the function that handles post requests it uses the POSTurlFunc argument 
    //it exectues the functions by url name the object should be set like this:
    /* 
        let POSTurlFunc = {
            /PostReqUrlName: function(res, req, cookies, data) {what the function does}
        }
        if the cookies are not set you will get a empty object returned if the data is empty you will get a empty string returned 
    */
    postReqHandler(){
        if(this.req){
            let actUrl = '/'+this.url.split("/").slice(-1);
            let cookies = {};
            let data = '';
            if(this.method != 'POST') return this;
            if(this.cookie != undefined){
                let splitCookie = this.cookie.split("; ");
                if(Array.isArray(splitCookie) != true){
                    splitCookie = [splitCookie];
                }
                for(var i = 0; i<splitCookie.length; i++){
                    let cookiePart = splitCookie[i].split("=");
                    cookies[cookiePart[0]] = cookiePart[1]; 
                }
            }
            this.req.on('data', chunk => {
                data += chunk;
            });
            this.req.on('end', ()=>{
                if(actUrl in this.POSTurlFuncs) this.POSTurlFuncs[actUrl](this.req, this.res, cookies, data);
            });
        }
    }
    
    //cookie setter takes in params dataAndName with should be taken in as formated arrays of json: [{name: 'name', data: 'data'}]
    //parameter response data should be a object formated like: {contentType: 'content type' execFunc: function(req, res){//function}, 
    //you have to write the write() and end() statments alone or page streams for page returns
    cookieSetter(dataAndName, responseData){
        if(this.req){
            if(dataAndName == null || dataAndName == undefined || dataAndName == '') return console.error('Paramater containing data and name is missing!');
            let cookie = dataAndName.reduce((accum, curr) => {
                return accum + `${curr.name}=${curr.data}; `;
            }, '');
            if(responseData == null || responseData == undefined || responseData == ''){
                this.res.writeHeader(204, {'Set-Cookie': cookie, 'Access-Control-Allow-Origin': '*'});
                this.res.end();
            }else{
                this.res.writeHeader(200, {'Content-Type': responseData.contentType, 'Set-Cookie': cookie, 'Access-Control-Allow-Origin': '*'})
                responseData.execFunc(this.req, this.res);
            }
        }
    }
}

module.exports = HttpServer