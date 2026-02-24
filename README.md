🚀 SiteCheck API – Backend

A scalable Node.js + Express backend for a Website SEO & Performance Analyzer.
This backend handles authentication, website analysis, report generation, and history management.

✨ Key Features

🔐 JWT Authentication (Login / Register)

🌐 Website SEO & Performance Analysis

📊 Automated Score Calculation (0–100)

🧾 Detailed Issues & Optimization Suggestions

🗂️ Analysis History per User

⚡ Basic Performance Metrics (Page Size, Image Count, Scripts)

🧠 Rule-based Analyzer Engine

🧩 Modular MVC Architecture

🌱 Environment-based configuration

🧠 Analyzer Capabilities

Website Audit Engine
User submits a website URL like:

(https://site-check-com.vercel.app/)

The analyzer automatically checks:

.Title tag presence

.Meta description

.H1 structure

.Images without alt text

.Page size estimation

.Script & resource count

⚡ Scoring System
Each website receives:

.Overall score (0–100)

.List of issues detected

.Actionable optimization suggestions

📜 Report History

Every analysis is stored with:

.User reference

.URL analyzed

.Score

.Metrics

.Timestamp

Users can view their past reports from the dashboard.

🛠️ Tech Stack

.Node.js

.Express.js

.MongoDB + Mongoose

.JWT Authentication

.Cheerio (HTML Parsing)

.Axios / Fetch

.dotenv

▶️ Run Locally

git clone https://github.com/sahillll0/SiteCheck_API

cd SiteCheck_API

npm install

npm run dev

🔗 API Highlights

.POST /auth/register

.POST /auth/login

.POST /analyze

.GET /reports

.GET /reports/:id

.DELETE /reports/:id

🌐 Frontend Integration

Frontend will consume these APIs to:

.Submit website URLs for analysis

.Display scores and suggestions

.Show user analysis history

⭐ Final Note

This backend is designed with real product architecture in mind —
focusing on analysis logic, scalability, and clean modular structure.

🤝 Author & Acknowledgements

Made with ❤️ by **sahillll0**

If this project helped you, please ⭐ star the repo — it motivates me to build more useful tools.

“Build tools that developers actually need.” — **sahillll0**
