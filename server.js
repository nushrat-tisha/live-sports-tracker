require("dotenv").config();
const express = require("express");

const app = express();

const PORT = 3000;

const API_KEY = process.env.API_KEY;

app.use(express.static("."));
app.get("/api/fixtures", async function(req, res) {

    try {

        const date = req.query.date;

        const response = await fetch(
            `https://v3.football.api-sports.io/fixtures?date=${date}`,
            {
                headers: {
                    "x-apisports-key": API_KEY
                }
            }
        );

        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Failed to fetch fixtures"
        });

    }

});
app.get("/api/standings", async function(req, res) {

    try {

        const league = req.query.league || 39;

        const season = 2026;

        const response = await fetch(
            `https://v3.football.api-sports.io/standings?league=${league}&season=${season}`,
            {
                headers: {
                    "x-apisports-key": API_KEY
                }
            }
        );

        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Failed to load standings"
        });

    }

});

app.listen(PORT, function() {

    console.log(`Server running at http://localhost:${PORT}`);

});