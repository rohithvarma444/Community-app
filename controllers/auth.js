import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateFromEmail } from "unique-username-generator";
import prisma from "../db/prisma/db.js";
import { UAParser } from "ua-parser-js";
//generate a username from the email
//MAX_RETRIES is 5 to avoid infinite loop
async function generateUsername(email) {
    const MAX_RETRIES = 5;
    let count = 0;
    let username;

    while (count < MAX_RETRIES) {
        username = generateFromEmail(email, 3);
        const user = await prisma.user.findUnique({
            where: { username: username }
        });

        if (!user) {
            return username; 
        }

        count++;
    }

    return `${generateFromEmail(email)}_${Math.floor(1000 + Math.random() * 9000)}`;
}


//checking the user is already registered and registering
export const registerUser = async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
        where: { email: email }
    });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User has already been registered with us. Please login."
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const username = await generateUsername(email);

        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                username: username
            }
        });

        return res.status(201).json({
            success: true,
            message: "User has been registered successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error registering user",
            error: error.message
        });
    }
};


export const loginUser = async(req,res)=> {

    const {email,password} = req.body;

    const user = await prisma.user.findUnique({
        where:{
            email: email
        },
        select:{
            user_id : true,
            password: true,
        }
    })

    if(!user){
        return res.status(400).json({
            success: false,
            message: "User not found. Please register first."
        })
    }

    if( !(await bcrypt.compare(password, user.password))){
        return res.status(400).json({
            success: false,
            message: "Invalid password"
        })
    }


    const token = jwt.sign({id: user.user_id}, process.env.JWT_SECRET, {expiresIn: '1h'});

    const userAgent = new UAParser(req.headers['user-agent']);
    const browser = userAgent.getBrowser().name || "Unknown";
    const os = userAgent.getOS().name || "Unknown";
    const device = userAgent.getDevice().type || "Unknown";

    const session = await prisma.session.create({
        data:{
            user_id: user.user_id,
            token: token,
            browser: browser,
            os: os,
            device: device,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
            created_at: new Date()
        }
    })

    
    console.log(token);


    // in production, we need to use secure cookies so it can be retereived in xss attacks
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: "strict"
    })

    return res.status(200).json({
        success: true,
        message: "User has been loggedin successfully",
        token: token,
        userInfo: {
            username: user.username,
            email: email,
            userId: user.id
        }
    })
}


export const LogoutUser = async(req,res)=> {
    const userId = req.user.id;
    const sessionId = req.user.session;

    try{
        await prisma.session.deleteMany({
                where: {
                    session_id: sessionId
                }
            })

            res.clearCookie("token");

            return res.status(200).json({
                success: true,
                message: "User has been logged out successfully"
            })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }  
}


