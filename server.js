const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 读取创意数据
const creativeideasData = JSON.parse(fs.readFileSync('./creative-ideas.json', 'utf8'));

// 读取统计数据
let statsData = {};
try {
    statsData = JSON.parse(fs.readFileSync('./stats.json', 'utf8'));
    if (!statsData.startDate) {
        statsData.startDate = new Date().toISOString();
    }
} catch (error) {
    // 如果文件不存在，创建默认统计数据
    statsData = {
        pageViews: 0,
        getInspiration: 0,
        loveIdea: 0,
        clickPay: 0,
        dailyStats: {},
        lastUpdated: null,
        startDate: new Date().toISOString()
    };
}

// 保存统计数据到文件
function saveStats() {
    statsData.lastUpdated = new Date().toISOString();
    fs.writeFileSync('./stats.json', JSON.stringify(statsData, null, 2));
}

// 记录统计事件
function recordEvent(eventType) {
    const today = new Date().toISOString().split('T')[0];
    
    // 更新总计数
    if (statsData[eventType] !== undefined) {
        statsData[eventType]++;
    }
    
    // 更新每日统计
    if (!statsData.dailyStats[today]) {
        statsData.dailyStats[today] = {
            pageViews: 0,
            getInspiration: 0,
            loveIdea: 0,
            clickPay: 0
        };
    }
    
    if (statsData.dailyStats[today][eventType] !== undefined) {
        statsData.dailyStats[today][eventType]++;
    }
    
    saveStats();
    console.log(`📊 Event recorded: ${eventType} (Total: ${statsData[eventType]})`);
}

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json',
    '.xml': 'application/xml',
    '.txt': 'text/plain'
};

function getMimeType(filePath) {
    const extname = path.extname(filePath).toLowerCase();
    return mimeTypes[extname] || 'application/octet-stream';
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);

    // API路由处理
    if (pathname.startsWith('/api/')) {
        handleApiRequest(req, res, pathname);
        return;
    }

    // 静态文件服务
    let filePath = '.' + pathname;
    
    // 默认首页
    if (pathname === '/') {
        filePath = './index.html';
        // 记录页面访问
        recordEvent('pageViews');
    }

    // 检查文件是否存在
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // 404错误
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - Page Not Found</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        h1 { color: #667eea; }
                    </style>
                </head>
                <body>
                    <h1>404 - Page Not Found</h1>
                    <p>The requested page could not be found.</p>
                    <a href="/">Return to Creative Ideas Generator</a>
                </body>
                </html>
            `);
            return;
        }

        // 读取并返回文件
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Internal Server Error');
                return;
            }

            const mimeType = getMimeType(filePath);
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
        });
    });
});

// API请求处理
function handleApiRequest(req, res, pathname) {
    const apiPath = pathname.replace('/api/', '');
    
    switch (apiPath) {
        case 'health':
            handleHealthCheck(req, res);
            break;
        case 'random-idea':
            handleRandomIdea(req, res);
            break;
        case 'track':
            handleTrackEvent(req, res);
            break;
        case 'stats':
            handleGetStats(req, res);
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
}

// 健康检查API
function handleHealthCheck(req, res) {
    const response = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        totalIdeas: creativeideasData.ideas.length,
        version: '1.0.0'
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
}

// 随机创意API
function handleRandomIdea(req, res) {
    try {
        const ideas = creativeideasData.ideas;
        if (!ideas || ideas.length === 0) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'No ideas available' 
            }));
            return;
        }

        // 随机选择一个创意
        const randomIndex = Math.floor(Math.random() * ideas.length);
        const randomIdea = ideas[randomIndex];

        const response = {
            success: true,
            idea: randomIdea,
            totalIdeas: ideas.length
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        
        console.log(`Served random idea: "${randomIdea.title}" (ID: ${randomIdea.id})`);
    } catch (error) {
        console.error('Error serving random idea:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: false, 
            error: 'Internal server error' 
        }));
    }
}

// 统计事件追踪API
function handleTrackEvent(req, res) {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const { eventType } = JSON.parse(body);
            
            // 验证事件类型
            const validEvents = ['pageViews', 'getInspiration', 'loveIdea', 'clickPay'];
            if (!validEvents.includes(eventType)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid event type' }));
                return;
            }

            recordEvent(eventType);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                eventType, 
                totalCount: statsData[eventType] 
            }));
        } catch (error) {
            console.error('Error tracking event:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
}

// 获取统计数据API
function handleGetStats(req, res) {
    try {
        // 计算转化率
        const conversionRates = {
            inspirationRate: statsData.pageViews > 0 ? ((statsData.getInspiration / statsData.pageViews) * 100).toFixed(1) : 0,
            loveRate: statsData.getInspiration > 0 ? ((statsData.loveIdea / statsData.getInspiration) * 100).toFixed(1) : 0,
            payRate: statsData.loveIdea > 0 ? ((statsData.clickPay / statsData.loveIdea) * 100).toFixed(1) : 0,
            overallRate: statsData.pageViews > 0 ? ((statsData.clickPay / statsData.pageViews) * 100).toFixed(2) : 0
        };

        const response = {
            totalStats: {
                pageViews: statsData.pageViews,
                getInspiration: statsData.getInspiration,
                loveIdea: statsData.loveIdea,
                clickPay: statsData.clickPay
            },
            conversionRates,
            dailyStats: statsData.dailyStats,
            period: {
                startDate: statsData.startDate,
                lastUpdated: statsData.lastUpdated
            }
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
    } catch (error) {
        console.error('Error getting stats:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}



// 启动服务器
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // 绑定到所有网络接口

server.listen(PORT, HOST, () => {
    // 获取本机IP地址
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let localIP = '127.0.0.1';
    
    // 查找本地IP地址
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                localIP = interface.address;
                break;
            }
        }
        if (localIP !== '127.0.0.1') break;
    }
    
    console.log('🚀 Creative Ideas Generator Server Started!');
    console.log('='.repeat(60));
    console.log(`📱 Local Access: http://127.0.0.1:${PORT}`);
    console.log(`🌐 Network Access: http://${localIP}:${PORT}`);
    console.log(`⚡ API Health: http://${localIP}:${PORT}/api/health`);
    console.log(`🧠 Random Idea: http://${localIP}:${PORT}/api/random-idea`);
    console.log(`📊 Analytics: http://${localIP}:${PORT}/stats.html`);
    console.log('='.repeat(60));
    console.log(`💡 Total Ideas Available: ${creativeideasData.ideas.length}`);
    console.log('🎯 Server is accessible from any device on your network!');
    console.log('📱 Use the Network Access URL on phones/tablets');
    console.log('Press Ctrl+C to stop the server');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Creative Ideas Generator Server...');
    console.log('👋 Thanks for using Creative Ideas Generator!');
    process.exit(0);
}); 