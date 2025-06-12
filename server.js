const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors());
app.use(express.json());

// 读取创意数据
let creativeIdeas = [];
try {
    const data = fs.readFileSync(path.join(__dirname, 'creative-ideas.json'), 'utf8');
    creativeIdeas = JSON.parse(data).ideas;
    console.log(`✅ 已加载 ${creativeIdeas.length} 个创意想法`);
} catch (error) {
    console.error('❌ 读取创意数据失败:', error);
    process.exit(1);
}

// API: 获取随机创意
app.get('/api/random-idea', (req, res) => {
    try {
        if (creativeIdeas.length === 0) {
            return res.status(404).json({ error: '没有可用的创意数据' });
        }

        // 随机选择一个创意
        const randomIndex = Math.floor(Math.random() * creativeIdeas.length);
        const randomIdea = creativeIdeas[randomIndex];

        console.log(`🎯 返回创意: ${randomIdea.title} (ID: ${randomIdea.id})`);
        
        res.json({
            success: true,
            idea: randomIdea,
            totalIdeas: creativeIdeas.length
        });
    } catch (error) {
        console.error('❌ 获取随机创意失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// API: 获取创意统计信息
app.get('/api/stats', (req, res) => {
    try {
        const categories = {};
        const impacts = {};
        const difficulties = {};

        creativeIdeas.forEach(idea => {
            // 统计分类
            categories[idea.category] = (categories[idea.category] || 0) + 1;
            
            // 统计影响级别
            impacts[idea.impact] = (impacts[idea.impact] || 0) + 1;
            
            // 统计难度级别
            difficulties[idea.difficulty] = (difficulties[idea.difficulty] || 0) + 1;
        });

        res.json({
            success: true,
            stats: {
                totalIdeas: creativeIdeas.length,
                categories,
                impacts,
                difficulties
            }
        });
    } catch (error) {
        console.error('❌ 获取统计信息失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        totalIdeas: creativeIdeas.length,
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 创意想法API服务器运行在: http://localhost:${PORT}`);
    console.log(`📊 API端点:`);
    console.log(`   - GET /api/random-idea - 获取随机创意`);
    console.log(`   - GET /api/stats - 获取统计信息`);
    console.log(`   - GET /health - 健康检查`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    process.exit(0);
}); 