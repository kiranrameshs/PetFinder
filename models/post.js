const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postSchema = new Schema({
    title:{
        type: String
    },
    body:{
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    status: {
        type: String,
        default: 'public'
    },
    date: {
        type: Date,
        default: Date.now
    },
    tag: {
        type: String,
        default: 'lost'
    },
    // img: 
    // { 
    //     data: Buffer, 
    //     contentType: String,
    //     url: String 
    // }, 
    image: {
        type: String,
        default: ''
    },
    allowComments: {
        type: Boolean,
        default: true
    },
    comments: [{
        commentBody: {
            type: String
        },
        commentUser: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        commentDate: {
            type: Date,
            default: Date.now
        }
    }],
    annotations: [{
        element: {
            type: String,
            default: 'unknown'
        },
        firstTag: {
            type: String,
            default: 'unknown'
        },
        secondtTag: {
            type: String,
            default: 'unknown'
        },
        thirdTag: {
            type: String,
            default: 'unknown'
        },
        fourthTag: {
            type: String,
            default: 'unknown'
        },
    }]
});

module.exports = mongoose.model('post',postSchema);