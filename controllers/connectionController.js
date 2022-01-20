const model = require('../models/connection');
const userModel = require('../models/user');
const rsvpModel = require('../models/rsvp');

exports.connections = (req,res,next)=>{
    model.find()
    .then(connections=>{
    let topicArray = [];
 
    for(let i=0; i<connections.length;i++){
     let index = topicArray.findIndex(top => top == connections[i].topic);
     if(index == -1){
         topicArray.push(connections[i].topic);
        }
    } 
     res.render('./connection/connections',{connections,topicArray})})
    .catch(err=>next(err));
 };

exports.newConnection = (req,res,next)=>{
   res.render('./connection/newConnection');
};

exports.create = (req,res,next)=>{
    let conn = new model(req.body); 
    conn.host = req.session.user;
    conn.save()
    .then(conn=>{
        req.flash('success','Connection created successfully');
        res.redirect('/connections')})
    .catch(err=>{
        if(err.name === 'ValidationError'){
            req.flash('error',err.message);
            err.status= 400;
            return res.redirect('back');
        }
        next(err);
    });
};

exports.show = (req,res,next)=>{
   let id = req.params.id;
   //added in middlewares
    // if(!id.match(/^[0-9a-fA-F]{24}$/)){
    //     let err = new Error('Invalid connection id');
    //     err.status = 400;
    //     return next(err);
    // } 
    Promise.all([model.findById(id).populate('host','firstName lastName'), 
                rsvpModel.find({connection:id,status:'yes'}).countDocuments()])
    .then(conn=>{
        const [connection,rsvpArray] = conn;
        
        if(connection){
            let output = connection.toObject();
            output.rsvpArray = rsvpArray;
            let peopleGoing = output.rsvpArray;
            conn = conn[0];
            res.render('./connection/connection',{conn,peopleGoing});
        }else{
            let err = new Error('Cannot find connection with id '+id);
            err.status = 404;
            next(err);
    }
})
    .catch(err=>next(err));   
};

exports.edit = (req,res,next)=>{
   let id = req.params.id;
    // if(!id.match(/^[0-9a-fA-F]{24}$/)){
    //     let err = new Error('Invalid connection id');
    //     err.status = 400;
    //     return next(err);
    // } 
    model.findById(id)
    .then(conn=>{
        if(conn){
       res.render('./connection/edit',{conn});
       }else{
           let err = new Error('Cannot find connection with id '+id);
           err.status = 404;
           next(err);      
          }
        })
        .catch(err=>next(err));
};

exports.update = (req,res,next)=>{
   let conn = req.body;
   let id = req.params.id;

//    if(!id.match(/^[0-9a-fA-F]{24}$/)){
//         let err = new Error('Invalid connection id');
//         err.status = 400;
//         return next(err);
//     } 
   model.findByIdAndUpdate(id,conn,{useFindAndModify:false,runValidators:true})
    .then(conn=>{
        if(conn){
        req.flash('success','Connection updated successfully');
        res.redirect('/connections/'+id);
   } else {
       let err = new Error('Cannot find connection with id '+id);
       err.status = 404;
       next(err); 
       }
    })
    .catch(err=>{
        if(err.name === 'ValidationError')
        err.status=400;
        next(err);
        req.flash('error', err.message);
            return res.redirect('back');
    });
};

exports.delete = (req,res,next)=>{
    let id = req.params.id;

    // if(!id.match(/^[0-9a-fA-F]{24}$/)){
    //     let err = new Error('Invalid connection id');
    //     err.status = 400;
    //     return next(err);
    // } 
    Promise.all([model.findByIdAndDelete(id,{useFindAndModify:false}), deleteMany({connection:id})])
    .then(conn=>{    
        // const [connection,deletes]=result;
        if(conn){
            req.flash('success','Connection deleted successfully');
            res.redirect('/connections');
    } else{
       let err = new Error('Cannot find connection with id '+id);
       err.status = 404;
       next(err);     
    }
})
    .catch(err=>next(err));
};

exports.createRsvp = (req,res,next)=>{
    let id = req.params.id;
    let status = req.query.status;
    if(status){
        status = status.toLowerCase();
    }
    
    let userId = req.session.user;
    let rsvp1 = {};
        rsvp1['user'] = userId;
        rsvp1['connection'] = id;
        rsvp1['status'] = status;

    rsvpModel.findOne({connection:id,user:userId})
    .then(rsvp => {
        if(rsvp){ 
            if(rsvp.status===status){
                req.flash('success','RSVP is already done!'); 
                res.redirect('/users/profile');
            }else{

                rsvpModel.updateOne({connection:id},{$set: {status:status}},{runValidators:true})
                .then( rsvp =>{
                    req.flash('success','RSVP successfully updated for the connection!!');
                    res.redirect('/users/profile');
                })
                .catch(err =>{
                    if(err.name === 'ValidationError'){
                        err.status = 400;
                        req.flash('error',err.message);
                        res.redirect('back');
                    }else{
                        next(err);
                    }
                });
            }
        }else{
            let row = new rsvpModel(rsvp1);
            row.save()
            .then( rsvp =>{
                req.flash('success','RSVP successfully created for the connection!');
                res.redirect('/users/profile');
            })
            .catch(err =>{
                if(err.name === 'ValidationError'){
                    err.status = 400;
                    req.flash('error',err.message);
                    res.redirect('back');
                }else{
                    next(err);
                }
            });
        }    
    })
    .catch(err =>{
        next(err);
    });
}

exports.deleteRsvp = (req,res,next)=>{
    let id = req.params.id;
    let userId = req.session.user;

    rsvpModel.deleteOne({connection:id, user:userId})
    .then(result =>{
        req.flash('success','RSVP successfully deleted for the connection!');
        res.redirect('back');
    })
    .catch(err => next(err));
};

