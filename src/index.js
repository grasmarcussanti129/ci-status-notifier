// Importing required modules
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { WebClient } = require('@slack/web-api');

const app = express();
app.use(bodyParser.json());

// Slack token and email configuration
const slackToken = 'YOUR_SLACK_TOKEN'; // Replace with your Slack token
const emailConfig = {
    service: 'gmail',
    auth: {
        user: 'YOUR_EMAIL@gmail.com', // Replace with your email
        pass: 'YOUR_EMAIL_PASSWORD' // Replace with your email password
    }
};

const slackClient = new WebClient(slackToken);
const transporter = nodemailer.createTransport(emailConfig);

// Webhook listener 
app.post('/webhook', async (req, res) => {
    const { buildStatus, buildUrl, projectName } = req.body;
    const message = `Build ${buildStatus} for project ${projectName}. View more at ${buildUrl}`;

    // Send notification to Slack
    await slackClient.chat.postMessage({
        channel: '#general', // Change to your channel
        text: message
    });

    // Send email notification
    const mailOptions = {
        from: emailConfig.auth.user,
        to: 'recipient@example.com', // Replace with recipient email
        subject: `Build Status: ${buildStatus}`,
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email: ', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.status(200).send('Webhook received!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
