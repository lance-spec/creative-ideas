export default function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { action } = req.body || {};

    if (!action) {
        res.status(400).json({ error: 'Action is required' });
        return;
    }

    // 在Vercel serverless环境中记录行为
    console.log(`Tracking action: ${action}`);
    
    res.status(200).json({ 
        success: true, 
        message: `Action ${action} tracked successfully`,
        timestamp: new Date().toISOString()
    });
} 