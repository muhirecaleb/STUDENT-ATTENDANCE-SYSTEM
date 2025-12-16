import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//API to login User
export const login = async (req,res) => {
    
    const { email , password } = req.body;

    if(!email || !password) {
     return res.status(400).json({ success: false , message: "All fields are required" });
    };

    try {
        
        const existUser = await User.findOne({ email });

        if(!existUser) {
        return res.status(404).json({ success: false , message: "Email does not exist" });
        };

        //check if the password matches
        const checkPassword = await bcrypt.compare(password, existUser.password);


        if(!checkPassword) {{
            return res.status(400).json({ success: false , message: "Invalid credentials" }); 
        }};


        //create a token for the user

        const token = jwt.sign({ 
           userInfo: {
            ...existUser._doc,
             password: undefined
           }
         }, process.env.JWT_SECRET);
        

         res.status(200).json({ success: true, message: "Logged in successfully" , token  , user: {
             ...existUser._doc,
            password: undefined
         }});

    } catch (error) {
        console.log('error to login student', error);
         res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const checkAuth = async (req,res) => {
    
    const userInfo =  req.body.user;

    if(!userInfo) return res.status(401).json({ success: false , message: "No userInfo provided" });

    if(userInfo.role === 'Admin') return res.status(200).json({ success: true , user: userInfo });

    console.log(userInfo)
    
    try {

        const findUser = await User.findById(userInfo.userInfo._id); 

        if(findUser) return res.status(200).json({ success: true , user: userInfo });
       if(!findUser)  res.status(404).json({ success: false, message: "No user found" });
        
    } catch (error) {
         console.log('error to login student', error);
         res.status(500).json({ success: false, message: "Internal server error" });
    }
}