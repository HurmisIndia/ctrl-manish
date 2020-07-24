const t1=new Date().getTime();
const express = require('express');
const body_parser = require('body-parser');
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;


const app = express();
app.use(body_parser.json())
app.use(body_parser.raw())
app.use(body_parser.urlencoded())
const port = process.env.PORT || 3000;

var client, db, user_data, post_body, post_stat, reports, api_keys, others;


var url = "mongodb+srv://manish:manish@cluster0.cqjkp.gcp.mongodb.net?retryWrites=true&w=majority";
//var url = "mongodb://localhost:27017";


MongoClient.connect(url, { useUnifiedTopology: true}, function (err, DBclient) {
  if (err) throw err;
  client = DBclient;

  db = client.db("ctrl_pluz");

  user_data = db.collection("user_data");
  post_body = db.collection("post_body");
  post_stat = db.collection("post_stat");
  reports = db.collection("reports");
  api_keys = db.collection("api_keys");
  others = db.collection("others");

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    const t2=new Date().getTime();
    console.log("\nServer take : "+ (t2-t1) + " miliseconds to initilize...");
});


 
});






//NEED AN ALGORITHM TO HANDEL PROFILE  AVATAR
app.post('/signUp', async (req, res) => {
  try
  {
    var json=req.body;
    if(json.first_name !=null && json.last_name!=null && json.mail_id!=null &&  json.password!=null && json.avatar!=null)
    {
      json.avatar="https://image.link" //this should be replace by firebase storage upload method. before that dataurl to blob.
      json.verified = false;
      json.posts = [];
      json.read_history = [];
      json.saved = [];
      json.follower = [];
      json.following = [];
      total_view = 0;
      
      const result=await user_data.insertOne(json);
 


      //send verification message to user mail_id


      res.send({"user_id":result.ops[0]._id, "result": true});

    }else{
      console.error("some parameater was missing");
      res.send({"result":false});
    }

  } catch (error) {
    console.error(error);
    res.send({"result": false});
  }
});

app.post('/mailExist',  async (req, res) => {
  try
  {
    if(req.body.mail_id!=null){
  const result= await user_data.findOne({"mail_id":req.body.mail_id});
  console.log(result);
  if(result!=null){
  var json={};
  json.first_name=result.first_name
  json.last_name=result.last_name
  json.exist=true
  res.send(json);
  }else{
    res.send({"exist":false});
  }
    }else{
      console.error("mail_id missing in request...");
    }
    

    
  } catch (error) {
    console.error(error);
  }

});

//NEED AN ALGORITHM TO HANDEL PROFILE  AVATAR
app.post('/logIn', async  (req, res) => {
  try
  {
    if(req.body.login_method!=null){
      switch(req.body.login_method){
        case 'local':{
          if(req.body.mail_id!=null && req.body.password!=null){
           const result = await user_data.findOne({"mail_id":req.body.mail_id});
           if(result!=null){
             console.log(result);
             if(result.password==req.body.password){
               result.result=true;
              res.status(200).send(result);
             }else{
            res.send({"result": false,"message": "password did not match"});
           }

           }else{
            res.send({"result": false, "message": "mail_id doesn't exist in database"});
           }
          }else
          {
            res.send({"result": false, "message": "some local login param missing"});
          }
          break;
        }
        case 'oauth':{
          //console.log("oauth");
          if(req.body.mail_id!=null && req.body.first_name!=null && req.body.last_name!= null){
            const result = await user_data.findOne({"mail_id":req.body.mail_id});
            if(result!=null){
              var query = { "mail_id": req.body.mail_id };
              var newvalues = { $set: {"first_name": req.body.first_name, "last_name":req.body.last_name } };
               await user_data.updateOne( query, newvalues );
              const result2= await user_data.findOne( query );
              //console.log(result2);
              result2.result=true;
              res.send(result2) 
            }else{
             res.send({"result": false, "message": "mail_id doesn't exist in database"});
            }

          }else{
            res.send({"result": false, "message": "oauth failed"});
          }
          break;
        }
      }
    }else{
      res.send({"result": false, "message": "declear login_method"});
    }

    
  } catch (error) {
    console.error(error);
  }

});








//THIS TWO ROUT NEED NODEMAILER
app.post('/verifiy', async (req, res) => {
  try
  {
    


  } catch (error) {
    console.error(error);
  }

});

app.post('/forgetPassword', async  (req, res) => {
  try
  {
    

    
  } catch (error) {
    console.error(error);
  }

});

app.post('/updatePassword', async  (req, res) => {
  try
  {
    

    
  } catch (error) {
    console.error(error);
  }

});






app.post('/createPost',  async (req, res) => {
  try
  {
    if(req.body.user_id!=null  && req.body.title!=null){

      var result = await post_body.insertOne({content:req.body.content});
      if(result!=null){
      var json={}

      json.title=req.body.title;
      json.user_id=new ObjectId( req.body.user_id );
      json.post_body=new ObjectId( result.ops._id );
      json.type= req.body.type
      json.status=req.body.status
      json.summary=req.body.summary;
      json.thumbnail=req.body.thumbnail;
      json.category=req.body.category;
      json.word_count=req.body.word_count;
      json.views=0
      json.comments=[];
      json.share=0;
      json.duration=0;

      var result1 = await post_stat.insertOne(json);
      if(result1!=null){
        
      let post_id=result1.ops._id;
      await user_data.updateOne({_id:ObjectId(req.body.user_id)},{$push:{"posts" : ObjectId(post_id)}})
      res.send({"result":true});
    }
    }




    }else{
      res.send({result : false, message : "The user_id object missing in request"});
    }

    
  } catch (error) {
    console.error(error);
  }

});

app.post('/getPost',  async (req, res) => {
  try
  {
   if(req.body.post_id!=null) {
    var pipeline=[
      {
        '$match': {
          '_id': new ObjectId(req.body.post_id)
        }
      }, {
        '$lookup': {
          'from': 'user_data', 
          'localField': 'user_id', 
          'foreignField': '_id', 
          'as': 'user'
        }
      }, {
        '$unwind': {
          'path': '$user'
        }
      }, {
        '$project': {
          'title': 1, 
          'type': 1, 
          'summery': 1, 
          'thumbnail': 1, 
          'category': 1, 
          'word_count': 1, 
          'post_body': 1, 
          'views': 1, 
          'comments': 1, 
          'share': 1, 
          'duration': 1, 
          'user': 1
        }
      }
    ];
    var result=await post_stat.aggregate(pipeline).toArray();
    //console.log(result);
    if(result!=null){
      result=result[0];

      var user={};
      user.first_name=result.user.first_name;
      user.last_name=result.user.last_name;
      user.user_id=result.user.user_id;
      result.user=user;
      result.comments=result.comments.size
      result.result=true;
      res.send(result);

      
    }else{
      res.send({result : false, message : "no post found with this id" });
    }

   }else{
     res.send({result : false, message : "The post_id object missing in request"});
   }
    

    
  } catch (error) {
    console.error(error);
  }

});

app.post('/usersPosts', async  (req, res) => {
  try
  {
  if(req.body.user_id!=null){
    const usersPost_pipelines=[
      {
        '$match': {
          '_id': new ObjectId(req.body.user_id)
        }
      }, {
        '$project': {
          'posts': 1
        }
      }, {
        '$lookup': {
          'from': 'post_stat', 
          'localField': 'posts', 
          'foreignField': '_id', 
          'as': 'posts'
        }
      }, {
        '$project': {
          '_id': 0, 
          'posts': 1
        }
      }
    ];
    var result=await user_data.aggregate(usersPost_pipelines).toArray();
    result=result[0];
    if(result!=null){
      result.result=true;
      console.log(result);
      res.send(result);
    }else{
      res.send({"result":false,"message":"user don't write any post"});
    }

  } else{
    res.send({"result": false,"message": "no user_id found in request."});
  } 

    
  } catch (error) {
    console.error(error);
  }

});

app.post('/getPostContent',  async (req, res) => {
  try
  {
    

    
  } catch (error) {
    console.error(error);
  }

});

app.post('/getTopWriters', async  (req, res) => {
  try
  {
    

    
  } catch (error) {
    console.error(error);
  }

});

app.post('/getRecomanded', async  (req, res) => {
  try
  {
    

    
  } catch (error) {
    console.error(error);
  }

});


app.post('/getLeatest', async  (req, res) => {
  try
  {
    

    
  } catch (error) {
    console.error(error);
  }

});






app.post('/getCategories',  async (req, res) => {
  try
  {
    

    
  } catch (error) {
    console.error(error);
  }

});

app.post('/getCategoryContents',  async (req, res) => {
  try
  {
    

    
  } catch (error) {
    console.error(error);
  }

});







app.post('/getSavedStories', async  (req, res) => {
  try
  {
    if(req.body.user_id!=null){
      const usersPost_pipelines=[
        {
          '$match': {
            '_id': new ObjectId(req.body.user_id)
          }
        }, {
          '$project': {
            'saved': 1
          }
        }, {
          '$lookup': {
            'from': 'post_stat', 
            'localField': 'saved', 
            'foreignField': '_id', 
            'as': 'saved'
          }
        }, {
          '$project': {
            '_id': 0, 
            'saved': 1
          }
        }
      ];
      var result=await user_data.aggregate(usersPost_pipelines).toArray();
      result=result[0];
      if(result!=null){
        result.result=true;
        //console.log(result);
        res.send(result);
      }else{
        res.send({"result":false,"message":"user don't write any post"});
      }
  
    } else{
      res.send({"result": false,"message": "no user_id found in request."});
    } 

    
  } catch (error) {
    console.error(error);
  }

});

app.post('/saveStory', async  (req, res) => {
  try
  {
    if( req.body.user_id!=null && req.body.post_id!=null ){
      var result = await user_data.updateOne( { _id : ObjectId(req.body.user_id)}, { $push:{"saved": ObjectId(req.body.post_id)}});
      if(result!=null){
       // console.log(result);
        res.send({"result":true});
      }
    }else{
      res.send({"result": false,"message": "some params are missing in request."});
    }

    
  } catch (error) {
    console.error(error);
  }

});

app.post('/unsaveStory', async  (req, res) => {
  try
  {
    if( req.body.user_id!=null && req.body.post_id!=null ){
      var result = await user_data.updateOne( { _id : ObjectId(req.body.user_id)}, { $pull:{saved: new ObjectId(req.body.post_id)}});
      if(result!=null){
        //console.log(result);
        res.send({"result":true});
      }
    }else{
      res.send({"result": false,"message": "some params are missing in request."});
    }

    
  } catch (error) {
    console.error(error);
  }

});







app.post('/postComment', async  (req, res) => {
  try
  {
    if( req.body.user_id!=null && req.body.post_id!=null && req.body.comment!=null ){
     await post_stat.updateOne({ _id : ObjectId(req.body.post_id)}, { $push:{"comments":{"user_id":new ObjectId(req.body.user_id), "comment":req.body.comment }}});
     res.send({"result" : true});
    }else{
      res.send({"result": false,"message": "some params are missing in request."});
    }
    

    
  } catch (error) {
    console.error(error);
  }

});


app.post('/updateComment', async  (req, res) => {
  try
  {
    if( req.body.user_id!=null && req.body.post_id!=null && req.body.oldComment!=null && req.body.newComment!=null ){
      await post_stat.updateOne({ _id : ObjectId(req.body.post_id), comments:{user_id:new ObjectId(req.body.user_id), "comment" : req.body.oldComment}}, {$set:{"comments.$.comment":req.body.newComment}});
      res.send({"result" : true});
     }else{
       res.send({"result": false,"message": "some params are missing in request."});
     } 

    
  } catch (error) {
    console.error(error);
  }

});

app.post('/removeComment',  async (req, res) => {
  try
  {
    if( req.body.user_id!=null && req.body.post_id!=null && req.body.comment!=null ){
      await post_stat.updateOne({ _id : ObjectId(req.body.post_id)}, { $pull:{"comments":{"user_id":new ObjectId(req.body.user_id), "comment":req.body.comment }}});
      res.send({"result" : true});
     }else{
       res.send({"result": false,"message": "some params are missing in request."});
     }

    
  } catch (error) {
    console.error(error);
  }

});





app.post('/appriciatepost',  async (req, res) => {
  try
  {
    

    
  } catch (error) {
    console.error(error);
  }

});

app.post('/Unappriciatepost',  async (req, res) => {
  try
  {
    

    
  } catch (error) {
    console.error(error);
  }

});







//TO GET PARAM VALUES IN URL
app.get('/param', (req, res) => {
  console.log(req.query.value);
  res.send(req.query.value);
});

//MOST REQUEST SHOULD BE POST WITH JSON RAW BODY
app.post('/form', (req, res) => {
  console.log(req.body);
  res.send(req.body)
});


function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
  while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
      type: mime
  });
}

