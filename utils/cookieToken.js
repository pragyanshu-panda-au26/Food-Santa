const cookieToken = async(user, res) => {
    const token = await user.getJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.Cookie_Time * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    user.password = undefined
    res.status(200).cookie("token", token, options).json({
        success: true,
        token: token,
        user
    })
}



module.exports = cookieToken