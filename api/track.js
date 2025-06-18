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

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { action } = req.body;

        if (!action) {
            res.status(400).json({ error: 'Action is required' });
            return;
        }

        // 在Vercel环境中，由于serverless特性，我们需要使用其他方式存储数据
        // 这里我们返回成功但不实际保存，或者使用外部数据库
        
        // 对于演示目的，我们返回模拟数据
        console.log(`Tracking action: ${action}`);
        
        res.status(200).json({ 
            success: true, 
            message: `Action ${action} tracked successfully`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error tracking data:', error);
        res.status(500).json({ 
            error: 'Failed to track data',
            success: false 
        });
    }
} 