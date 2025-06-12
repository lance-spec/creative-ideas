export default function handler(req, res) { res.setHeader("Access-Control-Allow-Origin", "*"); res.status(200).json({id: 1, title: "Test Idea", description: "This is a test creative idea"}); }
