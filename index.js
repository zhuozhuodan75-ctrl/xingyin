const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

// 允许前端跨域调用接口
app.use(cors());
// 解析JSON格式的请求数据
app.use(express.json());

// ---------- 这里换成你自己的 Supabase 配置 ----------
const SUPABASE_URL = 'https://jcxafylawkcuimxfmtb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YoxuKzB9WjU_PG5HQQUKuA_4wvVEdhk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// --------------------------------------------------

// 测试接口：获取所有歌曲数据
app.get('/api/songs', async (req, res) => {
  try {
    const { data, error } = await supabase.from('songs').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 启动服务
app.listen(PORT, () => {
  console.log(`✅ 后端服务已启动！`);
  console.log(`👉 访问地址：http://localhost:${PORT}/api/songs`);
});