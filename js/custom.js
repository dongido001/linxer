//open database connection...
Linxer.dbs.open();

Linxer.dbs.createTable();

Linxer.dbs.getLinks(); //lists the link stored in the database

$("#linxerForm").submit( function(e) {
  e.preventDefault();

     var url = $("#url").val();
     if( isValidURL(url) ){
         Linxer.dbs.addLink( url );

         $("#url").val('');
         $("#submit").attr('disabled', true);
     }
     else{
      alert("please, provide a valid url");
     }

});

function isValidURL(url){

      var RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
 
      if(RegExp.test(url)){
         return true;
      }else{
         return false;
      }
}
