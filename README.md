# Simple-BackEnd
Simple node.js backend server

### What is it used for?

* **Serving pages:** Allows you to serve all .html pages that are stored in the *"/html"* folder in the project folder to their respective urls so for example 
  *index.html* would be changed to *http://yourdomain.com/index* but you can also adjust it if you wish.
* **Serving files to html pages:** Allows for easy serving of, js, css, and other file types to front end this can be done by simply specifing the path of where the files are       stored, then you can link the any way you want to the front end just make sure you include the correct domain URL so valid path for the file *index.css* would be                   *http://yourdomain.com/css/index.css, http://yourdomain.com/index.css/ or even http://yourdomain.com/home/home/random/home/index.css* so for as long as you include the file name   in the url you are fine.
* **Handeling POST and GET requests:** There is are functions that handles post and get requests where you can put in your own functions that get called when a request is gotten     on a spacific url for example the function *"/login"* will get trigered when a post request will be sent to the url */login*, the same can be done with get requests via a bit of   a diffrent method. The functions for POST and GET requests will also give you parsed JSON and cookie data alongside the request, and you also have access to the entire *req*       object.
* **Setting cookies:** You can also set cookies, when recieving a request, there is a seperate function to do that, you can set custom flags with the cookie aswell, upon getting     further requests you will get the parsed cookies alongside the other data.

### Future implementations

* **More flexability with linking other files to the frontend**
* **Beeing able to make a .config file to set some aditional parameter**
* **Seamlessly transition between https and http**
* **Websocket integration**
