import fs from 'fs';
import path from 'path';

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

    try {
        // 读取stats.json文件
        const statsPath = path.join(process.cwd(), 'stats.json');
        
        let stats = {
            pageViews: 0,
            getInspiration: 0,
            loveIdea: 0,
            clickPay: 0,
            startDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        // 如果文件存在，读取数据
        if (fs.existsSync(statsPath)) {
            const fileContent = fs.readFileSync(statsPath, 'utf8');
            stats = JSON.parse(fileContent);
        }

        // 计算转化率
        const conversionRates = {
            inspirationRate: stats.pageViews > 0 ? ((stats.getInspiration / stats.pageViews) * 100).toFixed(1) : '0.0',
            loveRate: stats.getInspiration > 0 ? ((stats.loveIdea / stats.getInspiration) * 100).toFixed(1) : '0.0',
            payRate: stats.loveIdea > 0 ? ((stats.clickPay / stats.loveIdea) * 100).toFixed(1) : '0.0',
            overallRate: stats.pageViews > 0 ? ((stats.clickPay / stats.pageViews) * 100).toFixed(1) : '0.0'
        };

        const response = {
            totalStats: {
                pageViews: stats.pageViews,
                getInspiration: stats.getInspiration,
                loveIdea: stats.loveIdea,
                clickPay: stats.clickPay
            },
            conversionRates,
            period: {
                startDate: stats.startDate,
                lastUpdated: stats.lastUpdated
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error reading stats:', error);
        res.status(500).json({ 
            error: 'Failed to read statistics',
            totalStats: {
                pageViews: 0,
                getInspiration: 0,
                loveIdea: 0,
                clickPay: 0
            },
            conversionRates: {
                inspirationRate: '0.0',
                loveRate: '0.0',
                payRate: '0.0',
                overallRate: '0.0'
            },
            period: {
                startDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            }
        });
    }
} 