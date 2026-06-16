const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Ensure these are set in your Render Environment Variables
const API_URL = "https://backend.api-wa.co/campaign/neodove/api/v2";
const API_KEY = process.env.API_KEY; 
const NEODOVE_WEBHOOK_URL = process.env.NEODOVE_WEBHOOK_URL;

app.get("/", (req, res) => res.send("CDS Backend Active"));

app.post("/send-otp", async (req, res) => {
    try {
        const { phoneNumber, userName, otpCode } = req.body;
        console.log(`[DEBUG] OTP for ${userName} (${phoneNumber}) is: ${otpCode}`);

        const payload = {
            apiKey: API_KEY,
            campaignName: "OTP5", 
            destination: phoneNumber,
            userName: userName,
            templateParams: [otpCode],
            source: "CDS Web Lead",
            buttons: [{ type: "button", sub_type: "url", index: 0, parameters: [{ type: "text", text: otpCode }] }]
        };

        await axios.post(API_URL, payload);
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
});

app.post("/submit-lead", async (req, res) => {
    try {
        const { name, qualification, city, course, phone } = req.body;
        
        // Leads are now forced into this single campaign
        const payload = {
            "name": name,
            "mobile": phone,
            "detail1": course,
            "detail2": qualification,
            "detail3": city,
            "detail5": "CDS 2026 Web Leads" 
        };

        const response = await axios.post(NEODOVE_WEBHOOK_URL, payload);
        return res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
});

app.listen(process.env.PORT || 3000);
