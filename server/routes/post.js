const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const verify = require("../middleware/verify");
const Post = mongoose.model("Post");

router.get("/allpost", verify, async (req, res) => {
  try {
    const post = await Post.find().populate(
      "postedBy",
      "id firstname lastname"
    );
    res.json({ post });
  } catch (error) {
    return res.status(401).send("Error");
  }
});

router.post("/createpost", verify, (req, res) => {
  const { title, description, url } = req.body.data1;
  console.log(req.body.data1);
  if (!title || !description || !url) {
    return res.status(422).json({ error: "Plase add all the fields" });
  }
  req.user.password = undefined;
  const post = new Post({
    title,
    description,
    image: url,
    postedBy: req.user,
  });
  post
    .save()
    .then((result) => {
      res.json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/mypost", verify, async (req, res) => {
  try {
    console.log(req.user._id);
    const post = await Post.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "id name"
    );
    if (post.length == 0) console.log("no post");
    res.json({ post });
  } catch (error) {
    return res.status(401).send(error.message);
  }
});

router.put('/likepost',verify,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
           console.log(req.body.postId)
            res.json(result)
            
        }
    })
})
router.put('/unlikepost',verify,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

router.put('/comment',verify,(req,res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

module.exports = router;
