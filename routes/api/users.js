const express = require('express');
const router = express.Router();
const User=require('../../models/User'); 
const gravatar=require('gravatar');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const keys=require('../../config/keys');
const passport=require('passport');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

//@route GET api/users/register
//@desc register users
//@access Public

router.post('/register',(req,res)=>{
    User.findOne({email:req.body.email})
        .then(user=>{
            if(user){
                return res.status(400).json({email:'Email Already exists'})
            }
            else{
                var avatar=gravatar.url(req.body.email,{s:200,r:'pg',default:'mm'})
                const newUser=new User({
                    name:req.body.name,
                    email:req.body.email,
                    avatar,
                    password:req.body.password
                });
                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(req.body.password,salt,(err,hash)=>{
                        if(err) throw err;
                        newUser.password=hash;
                        newUser.save()
                            .then(user=>res.json(user))
                            .catch(console.log(err));
                    })
                })
            }
        })
})


router.post('/login',(req,res)=> {
    const email=req.body.email;
    const password=req.body.password
    User.findOne({email})
        .then(user=>{
            if(!user){
                return res.status(404).json({email:'user not found'});
            }
            bcrypt.compare(password,user.password)
            .then(match=>{
                if(match){
                   //user match
                   var payload={id:user.id,name:user.name,avatar:user.avatar};
                   jwt.sign(payload,
                    keys.secretOrKey,
                    {expiresIn:3600},
                    (err,token)=>{
                            res.json({
                                msg:'success',
                                token:'Bearer '+token
                            });
                   }) ;
                }                    
                else{
                    res.status(400).json({password:'pswd incorrect'});
                }
            });
        });
    
});


//@route GET api/users/cuurent
//@desc register users
//@access Public
router.get('/current',passport.authenticate('jwt',{session:false}),(req,res)=>{
    
res.json(req.user);
});

module.exports = router;
