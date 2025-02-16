const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/run", (req, res) => {
    const { code, language } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: "Code and language are required." });
    }

    // Map language to Judge0 API language id
    const languageMap = {
        c: 50,
        cpp: 54,
        python: 71,
        javascript: 63,
        java: 62,
    };

    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
        return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    // Define Judge0 API options
    const options = {
        method: "POST",
        hostname: "judge0-ce.p.rapidapi.com",
        port: null,
        path: "/submissions?base64_encoded=false&wait=true",
        headers: {
            "Content-Type": "application/json",
            "x-rapidapi-key": "your api key",
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        },
    };

    const requestBody = JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: "",
    });

    // Send the request to Judge0 API
    const reqJudge0 = https.request(options, (resJudge0) => {
        const chunks = [];

        resJudge0.on("data", (chunk) => {
            chunks.push(chunk);
        });

        resJudge0.on("end", () => {
            const body = Buffer.concat(chunks);
            const response = JSON.parse(body.toString());

            if (response.stderr) {
                return res.json({ error: response.stderr });
            } else if (response.compile_output) {
                return res.json({ error: response.compile_output });
            }

            res.json({ output: response.stdout });
        });
    });

    reqJudge0.on("error", (error) => {
        console.error("Error connecting to Judge0 API:", error);
        res.status(500).json({ error: "Failed to connect to Judge0 API." });
    });

    reqJudge0.write(requestBody);
    reqJudge0.end();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
