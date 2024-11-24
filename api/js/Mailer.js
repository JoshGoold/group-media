const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.USERNAME,
        pass: process.env.PASSWORD,

    }
})

async function sendEmailNotification(user_email, subject, text){
    try {
      const info = await transporter.sendMail({
        from: `"Group Media" <${process.env.USERNAME}>`,
        to: user_email,
        subject: subject,
        text: text,
        html: `<h1>Log In to view: <a href="https://groupmedia.jginc.org/login">Click here</a></h1>`
    })
    console.log("Email sent ", info.messageId)
    return info  
    } catch (error) {
        console.error("Error sending email ", error)
        throw error
    }
    
}

module.exports = sendEmailNotification;