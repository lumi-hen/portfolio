var mongoose=require('mongoose')

// Portfolio schema
var PortfolioSchema=mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },
    slug:
    {
        type: String,
        
    },
    category:
    {
        type: String,
        required: true
    },
    desc:
    {
        type: String,
        required: true
    },

    image:
    {
        type: String,
    }
});

const Portfolio = module.exports = mongoose.model('Portfolio',PortfolioSchema);
