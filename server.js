const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const API_URL = "https://backend.api-wa.co/campaign/neodove/api/v2";
const API_KEY = process.env.API_KEY; 
const NEODOVE_WEBHOOK_URL = process.env.NEODOVE_WEBHOOK_URL;

const CAMPAIGN_MAP = {
    'AFCAT': 'AFCAT 2026 Web Leads',
    'CDS': 'CDS 2026 Web Leads'
};

app.get("/", (req, res) => res.send("Backend Active"));

app.post("/send-otp", async (req, res) => {
    try {
        const { phoneNumber, userName, otpCode } = req.body;
        // This log makes the OTP visible in your Render Dashboard Logs
        console.log(`[DEBUG] OTP for ${userName} (${phoneNumber}) is: ${otpCode}`);

        const payload = {
            apiKey: API_KEY,
            campaignName: "OTP5", 
            destination: phoneNumber,
            userName: userName,
            templateParams: [otpCode],
            source: "Web Lead",
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
        const { name, qualification, city, course, phone, campaignKey } = req.body;
        const selectedCampaign = CAMPAIGN_MAP[campaignKey] || "General Web Leads";

        const payload = {
            "name": name,
            "mobile": phone,
            "detail1": course,
            "detail2": qualification,
            "detail3": city,
            "detail5": selectedCampaign
        };

        // NeoDove handles duplicates if configured in their dashboard
        const response = await axios.post(NEODOVE_WEBHOOK_URL, payload);
        return res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Submission Failed" });
    }
});

app.listen(process.env.PORT || 3000);
