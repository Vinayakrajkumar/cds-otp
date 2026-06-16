const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// ==========================================
// CONFIGURATION
// ==========================================

const API_URL = "https://backend.api-wa.co/campaign/neodove/api/v2";
const API_KEY = process.env.API_KEY; 
const NEODOVE_WEBHOOK_URL = process.env.NEODOVE_WEBHOOK_URL;

// Mapping for your different campaigns
const CAMPAIGN_MAP = {
    'AFCAT': 'AFCAT 2026 Web Leads',
    'CDS': 'CDS 2026 Web Leads'
};

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
    res.send("Hundred Learning Backend Running Successfully");
});

// ==========================================
// ROUTE 1: SEND OTP VIA WHATSAPP
// ==========================================

app.post("/send-otp", async (req, res) => {
    try {
        const { phoneNumber, userName, otpCode } = req.body;

        if (!phoneNumber || !otpCode) {
            return res.status(400).json({ success: false, message: "phoneNumber and otpCode required" });
        }

        const payload = {
            apiKey: API_KEY,
            campaignName: "OTP5", 
            destination: phoneNumber,
            userName: userName || "Valued User",
            templateParams: [otpCode],
            source: "Web Lead", 
            media: {},
            buttons: [
                { type: "button", sub_type: "url", index: 0, parameters: [{ type: "text", text: otpCode }] }
            ],
            carouselCards: [], location: {}, attributes: {},
            paramsFallbackValue: { FirstName: "user" }
        };

        const response = await axios.post(API_URL, payload, {
            headers: { "Content-Type": "application/json" }
        });

        return res.status(200).json({ success: true, message: "OTP Sent", data: response.data });

    } catch (error) {
        console.error("Error Sending OTP:", error.response?.data || error.message);
        return res.status(500).json({ success: false, message: "Failed To Send OTP" });
    }
});

// ==========================================
// ROUTE 2: SUBMIT LEAD TO NEODOVE (Dynamic)
// ==========================================

app.post("/submit-lead", async (req, res) => {
    try {
        // 'campaignKey' is sent from your frontend (e.g., 'AFCAT' or 'CDS')
        const { name, qualification, city, school, course, phone, campaignKey } = req.body;

        // Fetch the correct campaign name from the map
        const selectedCampaign = CAMPAIGN_MAP[campaignKey] || "General Web Leads";

        console.log(`Pushing lead to ${selectedCampaign} for: ${name}`);

        const payload = {
            "name": name,
            "mobile": phone, 
            "detail1": course,
            "detail2": qualification,
            "detail3": city,
            "detail4": school,
            "detail5": selectedCampaign // Dynamically sets the campaign name
        };

        const response = await axios.post(NEODOVE_WEBHOOK_URL, payload, {
            headers: { "Content-Type": "application/json" }
        });

        return res.status(200).json({ success: true, message: "Lead saved successfully" });

    } catch (error) {
        console.error("Error saving to NeoDove:", error.response?.data || error.message);
        return res.status(500).json({ success: false, message: "Failed to save lead" });
    }
});

// ==========================================
// SERVER START
// ==========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
