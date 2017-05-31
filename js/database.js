var Linxer = {};
Linxer.dbs = {};

Linxer.dbs.db = null;

Linxer.dbs.open = function() {
  var dbSize = 5 * 1024 * 1024; // 5MB ( you can increase to whatever volume you want)

                              //DB name  //version //Description    //DB size
  Linxer.dbs.db = openDatabase("linxer",  "1",    "saves all links", dbSize);
}

//Error handling
Linxer.dbs.onError = function(tx, e) {
  alert("There has been an error: " + e.message);
}

//Success handling
Linxer.dbs.onSuccess = function(tx, r) {
  alert("success");
}

//creates table link if it does not exit
Linxer.dbs.createTable = function() {
  var db = Linxer.dbs.db;

  db.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS " +
                  "links(ID INTEGER PRIMARY KEY ASC,link VARCHAR(255), title VARCHAR(255), content TEXT, img VARCHAR(255), added_on DATETIME)", []);
  });
}

//saves our link to our database
Linxer.dbs.addLink = function(url) {
  var db = Linxer.dbs.db,
      addedOn = new Date(),
      img = "";

     $.get("http://linxer2.herokuapp.com/demo/fetch.php?url="+url) //this gets the url information( like images, title ...)
     .done( function(data){

   	     if( data.total_images > 0 ){
             img  = ( data.total_images > 1 ) ? data.images[1]['url'] : data.images[0]['url'];
   	     }
   	     else{
            img  = 'images/chrome.jpg';
   	     }

         db.transaction(function(tx){
           tx.executeSql("INSERT INTO links(link, title, content, img, added_on) VALUES (?,?,?,?,?)",
               [ url, data.title, data.description, img, addedOn],
               Linxer.dbs.onSuccess,
               Linxer.dbs.onError);
          });

         Linxer.dbs.getLinks(); //Renders the saved link
    })
   .fail( function(data){ //there was an error fetching the url informations, fall back to the default
       db.transaction(function(tx){
         tx.executeSql("INSERT INTO links(link, title, content, img, added_on) VALUES (?,?,?,?,?)",
             [url, url, "Empty data", 'images/chrome.jpg', addedOn],
             Linxer.dbs.onSuccess,
             Linxer.dbs.onError);
        });
       Linxer.dbs.getLinks();
   });
}

//Gets and renders links from the database
Linxer.dbs.getLinks = function(RenderFunc, amount) {
  var db = Linxer.dbs.db;
  db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM links ORDER BY ID DESC", [], function (tx, results) {

      var len = results.rows.length, i;
      var content = "";

         for (i = 0; i < len; i++){

           
          content += '<a href="'+ results.rows.item(i)['link'] +'" target="_blank">'+
                ' <section>'+
                  ' <div class="container py-3">'+
                     '<div class="card" id="no-padding">'+
                      ' <div class="row ">'+
                         '<div class="col-xs-4">'+
                             '<img src="'+ results.rows.item(i)['img'] +'" width="120px" heigth="70px">'+
                           '</div>'+
                           '<div class="col-xs-8 px-3">'+
                             '<div class="card-block px-3">'+
                               '<h4 class="card-title">'+ results.rows.item(i)['title'] +'</h4>'+
                               '<p class="card-text">'+ results.rows.item(i)['content'] +'</p>'+
                             '</div>'+
                           '</div>'+
                         '</div>'+
                       '</div>'+
                    ' </div>'+
                   '</div>'+
               '</section> </a> <br>';
         }

      if(len < 1){ content = "<h3 class='text-center'> No link saved yet</h3>"; }

      $("#links").html( content );
      $("#submit").attr('disabled', false);
     },
        Linxer.dbs.onError);
  });
}
