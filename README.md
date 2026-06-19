# 乡音 · Xiangyin

> 听见一方水土，留住文化的根。

乡音是一款面向中国方言保护与传承的移动端文化社交应用。用户可以通过录音、视频记录家乡方言，在互动地图上探索全国 34 个省级行政区的乡音文化，参与方言闯关学习，生成「乡音宝藏卡」，并以打卡、徽章等游戏化机制持续记录与分享。

当前仓库为 **前端原型**（React + Vite），业务数据以内存 Mock 为主；后端规划采用 **Supabase** 作为统一数据与媒体存储层。

---

## 项目简介

### 定位

乡音连接「记录方言」与「传播文化」两条主线：一端是 UGC 创作（录音、文案、地域标签），一端是结构化学习（地图探索、闯关答题、百科阅读）。产品以温暖、有文化质感的方式降低方言参与门槛，让方言不再只是「听不懂的声音」，而成为可收藏、可分享、可学习的文化资产。

### 目标用户

- 离乡在外的游子，希望用乡音表达身份认同
- 对方言、地域文化感兴趣的年轻用户
- 语言爱好者、教育工作者、文化保护从业者

### 当前实现状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 前端 UI / 交互 | ✅ 已完成 | 20+ 页面，移动端壳层，底部五栏导航 |
| 业务数据 | ⚠️ Mock | `App.tsx` Context 内存状态，无持久化 |
| 用户认证 | ❌ 未接入 | 设置页有 UI，无真实登录 |
| 音视频录制 | ⚠️ 模拟 | 波形动画模拟，未调用真实 MediaRecorder |
| 后端 API | ❌ 未接入 | 规划迁移至 Supabase |

### 品牌 IP

应用吉祥物为 **馒头蛙**（Mantou Frog）：点击按钮时伴随「呱」声与弹出动画，首页标题「乡音」支持探头互动，强化产品的趣味性与记忆点。

---

## 功能介绍

### 五大主模块

应用采用底部 Tab 导航，对应五个核心场景：

```
首页 · 发现 · 创作 · 消息 · 我的
```

#### 1. 首页（HomeFeed）

- 全屏竖滑信息流，类似短视频浏览体验
- **推荐 / 关注** 双 Tab 切换
- 每条作品展示：方言原文、地区标签、封面图、音频波形
- 支持双击点赞、查看普通话翻译、评论跳转
- 互动：点赞、评论、收藏、分享

#### 2. 发现（Discover）

- **方言地图**：交互式中国地图（SVG 水彩风格），支持缩放、拖拽、省份点击
- 34 个省级行政区数据：代表短语、乡音条数、地标 emoji
- **热门地区** 快捷入口
- **听听看**：各地方言音频样例列表
- **方言小百科**：横向卡片流，涵盖方言趣谈、语音知识、文化故事等

#### 3. 创作（Create）

- 选择背景模板（宣纸、旧报、木纹、地域风景等）
- 输入方言文案，调节字号
- 按地区（省·市）标注归属
- **录音** 或 **上传视频** 两种媒体模式
- 完成后生成 **乡音宝藏卡**（Canvas 绘制，可保存分享）

#### 4. 消息（Messages）

- 系统公告、评论回复、点赞、关注等通知
- 未读红点与底部导航角标
- 消息类型图标与色彩区分

#### 5. 我的（Profile）

- 个人资料：头像、昵称、等级、作品/获赞/关注/粉丝统计
- **每日打卡** 月历：连续打卡天数、关卡记录、里程碑图标
- 作品预览、快捷入口菜单
- 子页面：我的作品、宝藏卡、收藏、成就徽章、设置

### 扩展功能

| 功能 | 页面 | 描述 |
|------|------|------|
| 开屏动画 | `SplashScreen` | 云朵汇聚过渡，点击进入首页 |
| 作品详情 | `PostDetail` | 评论列表、音频播放、互动操作 |
| 地区详情 | `RegionDetail` | 省份方言视频 + 闯关入口 |
| 方言闯关 | `GameScreen` | 多关卡答题：听音辨义、翻译、填空等 |
| 打卡详情 | `CheckinDetail` | 月历统计、连续打卡里程碑弹窗 |
| 宝藏卡生成 | `CardGenerator` | Canvas 渲染卡片，模板切换 |
| 搜索用户 | `SearchPage` | 用户搜索与关注 |
| 百科详情 | `WikiDetail` | 文章阅读、收藏、分享 |
| 头像设置 | `AvatarSettings` | 昵称与预设头像选择 |
| 用户列表 | `UserList` | 粉丝 / 关注 / 获赞用户 |
| 设置 | `Settings` | 账号、通知、隐私、显示等 |

### 游戏化体系

- **打卡**：完成方言闯关后记录当日打卡，关联地区与关卡等级
- **连续打卡**：3 天 👍、7 天 🔥 里程碑
- **宝藏卡**：创作或闯关奖励的可视化收藏
- **成就徽章**：按地区与连续天数解锁（如「四川方言达人」）
- **闯关地图**：分关卡解锁，生命值、连击加分机制

---

## 技术路线

### 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    前端 (当前)                        │
│  React 19 + TypeScript + Vite 7 + Tailwind CSS 3    │
│  shadcn/ui · Lucide Icons · Context 状态管理         │
└──────────────────────┬──────────────────────────────┘
                       │ @supabase/supabase-js
┌──────────────────────▼──────────────────────────────┐
│                  Supabase (规划)                     │
│  Auth · PostgreSQL · Storage · Realtime · Edge Fn  │
└─────────────────────────────────────────────────────┘
```

### 前端技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 19.x |
| 语言 | TypeScript | 5.9 |
| 构建 | Vite | 7.x |
| 样式 | Tailwind CSS + tailwindcss-animate | 3.4 |
| 组件库 | shadcn/ui（Radix UI 基础） | 40+ 组件 |
| 图标 | Lucide React | — |
| 表单 | react-hook-form + zod | — |
| 路由 | 自定义 Screen 导航（Context） | 未使用 react-router 路由表 |

### 目录结构

```
xiangyin/
├── public/                  # 静态资源（地图 SVG、省份 JSON、图片、音频）
├── src/
│   ├── App.tsx              # 根组件、全局状态、底部导航、屏幕路由
│   ├── index.css            # 设计令牌、全局样式、动画
│   ├── components/
│   │   ├── MantouFrog.tsx   # 馒头蛙 IP 组件
│   │   ├── ChinaMap.tsx     # 地图组件
│   │   ├── GameLevels.tsx   # 关卡组件
│   │   └── ui/              # shadcn/ui 基础组件
│   ├── pages/               # 20 个业务页面
│   ├── data/
│   │   ├── regions.ts       # 34 省方言数据、地图配色
│   │   └── dialectWords.ts  # 闯关题库（多地区方言词汇）
│   ├── hooks/
│   └── lib/
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

### Supabase 后端规划

#### 核心服务选型

| Supabase 能力 | 用途 |
|---------------|------|
| **Auth** | 手机号 / 邮箱 / OAuth 登录，JWT 会话 |
| **PostgreSQL** | 业务关系数据，Row Level Security 权限控制 |
| **Storage** | 音频、视频、封面图、宝藏卡、头像文件 |
| **Realtime** | 消息通知、点赞数实时更新（可选） |
| **Edge Functions** | 音频转码、敏感词过滤、打卡结算等服务端逻辑 |

#### 数据模型（建议）

```sql
-- 用户资料（关联 auth.users）
profiles (
  id uuid PK → auth.users,
  nickname text,
  avatar_url text,
  bio text,
  level int,
  created_at timestamptz
)

-- 方言作品
posts (
  id uuid PK,
  author_id uuid → profiles,
  region text,          -- 如「四川·成都」
  dialect_text text,
  translation text,
  cover_url text,
  audio_url text,
  video_url text,
  duration int,
  likes_count int,
  comments_count int,
  created_at timestamptz
)

-- 互动
post_likes (post_id, user_id)
post_bookmarks (post_id, user_id)
comments (id, post_id, author_id, content, created_at)
follows (follower_id, following_id)

-- 消息通知
notifications (
  id, user_id, type,   -- system | comment | like | follow
  title, content, read, created_at
)

-- 打卡
checkins (
  id, user_id, date,
  region text, level int,
  created_at timestamptz
)

-- 游戏进度
game_progress (
  user_id, region text,
  unlocked_level int,
  completed_levels int[],
  updated_at timestamptz
)

-- 收藏资产
treasure_cards (id, user_id, region, city, phrase, bg_url, earned_date, consecutive_days)
badges (id, user_id, region, name, icon, color, earned_date, consecutive_days)

-- 百科（可种子数据 + CMS 扩展）
wiki_articles (id, title, category, color, content, read_time)

-- 地区元数据（种子数据，对应 regions.ts）
regions (short, full, city, phrase, color, landmark, position_x, position_y)
```

#### 前端接入步骤

1. **初始化 Supabase 项目**，配置 `.env`：
   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

2. **安装客户端**：`npm install @supabase/supabase-js`

3. **创建 `src/lib/supabase.ts`** 单例客户端

4. **替换 Mock 数据层**：
   - 将 `App.tsx` 中的 `initialPosts`、`initialMessages` 等迁移为 Supabase 查询
   - 抽取 `src/services/` 或 `src/hooks/` 封装 CRUD

5. **认证流程**：在 `Settings` / `Profile` 接入 `supabase.auth`

6. **媒体上传**：创作页录音/视频 → `supabase.storage.from('media')`

7. **RLS 策略**：用户只能修改自己的作品与资料；公开作品可读

#### 分阶段实施建议

| 阶段 | 目标 | 优先级 |
|------|------|--------|
| P0 | Auth + profiles + posts CRUD + Storage | 高 |
| P1 | 点赞/收藏/评论/关注 + 消息通知 | 高 |
| P2 | 打卡 + 游戏进度 + 徽章/宝藏卡 | 中 |
| P3 | 百科 CMS + 搜索（全文检索） | 中 |
| P4 | Realtime 通知 + Edge Functions 音频处理 | 低 |

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产包
npm run build

# 预览构建结果
npm run preview
```

环境要求：Node.js 20+

---

## UI 风格

### 设计理念

乡音的视觉语言定位为 **「温暖纸感 · 水墨乡韵 · 现代轻盈」**：以米白宣纸底色营造文化质感，以墨绿与赭红传递乡土气息，配合水彩地图与圆角卡片，在移动端呈现亲切、可读、有温度的方言文化体验。

### 色彩体系

| 角色 | 色值 | 用途 |
|------|------|------|
| 背景纸色 | `#F5F1E8` | 页面主背景，温暖米白 |
| 主色·墨绿 | `#2D5016` | 按钮、导航选中、打卡、主操作 |
| 辅色·酒红 | `#8B2635` | 强调、录音状态、地区印章 |
| 点缀·橙赭 | `#E67E22` | 点赞、连续打卡、闯关 Tab |
| 正文 | `#3E3E3E` | 主要文字 |
| 次要文字 | `#9E9E9E` | 说明、时间、占位符 |
| 边框 | `#E0D8C8` | 分割线、输入框边框 |
| 表面 | `#FFFFFF` | 卡片、弹层背景 |

CSS 变量定义于 `src/index.css`，同步映射至 Tailwind `primary` / `secondary` / `accent` 主题。

### 字体

- **界面正文**：系统无衬线栈（PingFang SC、Microsoft YaHei 等）
- **文化标题 / 卡片文案**：Noto Serif SC / Source Han Serif SC 衬线体
- 开屏「乡音」二字使用大号衬线 + 径向渐变填充，强化品牌识别

### 布局与容器

- **移动优先**：最大宽度 `430px`，高度 `100dvh`，居中于深色外框（模拟手机）
- **底部导航**：毛玻璃效果（`glass-nav`），高度 64px，创作按钮为圆形强调
- **卡片**：大圆角（`rounded-2xl`），绿色调柔和阴影（`card-shadow` / `card-shadow-lg`）
- **信息流**：首页全屏沉浸，发现/我的页可滚动列表

### 交互与动效

- 按钮点击：绿色闪烁反馈 + 馒头蛙弹出动画 + 「呱」音效
- 首页：竖滑 `snap` 吸附、双击爱心飘浮、波形播放动画
- 开屏：四角云朵汇聚 → 淡出 → 进入首页
- 地图：省份悬停变酒红、选中变墨绿，支持缩放拖拽
- 录音：脉冲环、实时波形条、酒红录制态
- 通用：`animate-fade-in`、`animate-slide-up`、`animate-scale-in`

### 地图视觉

发现页中国地图采用 **水彩插画风格**：

- 各省独立淡彩填充（`provinceColorMap`）
- 海洋背景 `#A8C8D8`，白云与飞鸟装饰
- 省份简称标签 + 文化地标 emoji（🐼 四川、🥟 上海等）
- 右下角南海诸岛附图、左下角罗盘

### 组件规范

- 基于 **shadcn/ui** + Radix 无障碍原语，保持一致的圆角、间距、焦点态
- 图标统一使用 **Lucide**，线宽随选中态变化
- 输入框：白底圆角全宽，聚焦时墨绿边框
- 弹窗 / 底部抽屉：白底 + 大圆角 + 半透明遮罩

### 设计令牌速查

```css
--color-bg: #F5F1E8;
--color-primary: #2D5016;
--color-secondary: #8B2635;
--color-accent: #E67E22;
--color-text: #3E3E3E;
--color-text-muted: #9E9E9E;
--color-border: #E0D8C8;
--radius: 0.75rem;
```

---

## 许可证

本项目为私有应用，未经授权请勿用于商业分发。

---

## 相关文档

- `info.md` — 脚手架初始化说明
- `src/data/regions.ts` — 省级方言种子数据
- `src/data/dialectWords.ts` — 闯关题库数据结构
