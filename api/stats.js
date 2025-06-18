export default function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // 由于Vercel serverless环境的限制，我们返回模拟数据
    // 在生产环境中，这些数据应该来自数据库
    const mockStats = {
        pageViews: 9,
        getInspiration: 6,
        loveIdea: 4,
        clickPay: 3,
        startDate: "2025-06-12T15:29:53.969Z",
        lastUpdated: new Date().toISOString()
    };

    // 计算转化率
    const conversionRates = {
        inspirationRate: mockStats.pageViews > 0 ? ((mockStats.getInspiration / mockStats.pageViews) * 100).toFixed(1) : '0.0',
        loveRate: mockStats.getInspiration > 0 ? ((mockStats.loveIdea / mockStats.getInspiration) * 100).toFixed(1) : '0.0',
        payRate: mockStats.loveIdea > 0 ? ((mockStats.clickPay / mockStats.loveIdea) * 100).toFixed(1) : '0.0',
        overallRate: mockStats.pageViews > 0 ? ((mockStats.clickPay / mockStats.pageViews) * 100).toFixed(1) : '0.0'
    };

    const response = {
        totalStats: {
            pageViews: mockStats.pageViews,
            getInspiration: mockStats.getInspiration,
            loveIdea: mockStats.loveIdea,
            clickPay: mockStats.clickPay
        },
        conversionRates,
        period: {
            startDate: mockStats.startDate,
            lastUpdated: mockStats.lastUpdated
        }
    };

    res.status(200).json(response);
} 