import jwt from "jsonwebtoken";

const genToken = async (userId) => {
    try{
        const token = jwt.sign(
            {userId},
            process.env.TOKEN_SECRET,
            {expiresIn: '7d'}
        )
        return token;
    }catch(err) {
        console.log(err);
    }
}

export default genToken;