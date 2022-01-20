const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const connectionSchema = new Schema({
    topic:{type:String,required:[true,'Topic is required']},
    title:{type:String,required:[true,'Title is required']},
    detail:{type:String,required:[true,'Detail is required'],minLength:[10,'The content should have atleast 10 characters']},
    // host:{type:String,required:[true,'Host name is required']},
    host:{type:Schema.Types.ObjectId,ref:'User'},
    where:{type:String,required:[true,'Location of meeting is required']},
    when:{type:String,required:[true,'Date is required'],match: [/\d{4}-\d{2}-\d{2}/]},
    start:{type:String,required:[true,'Start time is required'],match: [/\d{2}:\d{2}/]},
    end:{type:String,required:[true,'End time is required'],match: [/\d{2}:\d{2}/]},
    imageUrl:{type:String,required:[true,'Image URL is required']},
},
    {timestamps:true}
);

exports.find = ()=> connections;

module.exports = mongoose.model('Connection',connectionSchema);