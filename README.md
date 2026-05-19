# 乡音 (Xiangyin)

**听见一方水土，留住一缕乡音**

本 README 作为“项目说明书”，覆盖以下四大核心板块：**项目简介 / 功能模块构成 / 技术路线 / UI 风格规范**，并补充 **文件目录映射（含 Supabase 对接方向）**、**代码结构优化** 与 **mock → Supabase 数据迁移流程**。

## 项目简介

**乡音** 是一款基于 **Uni-app（Vue 3）** 的方言文化记录与分享应用，围绕“听见、记录、分享”构建完整链路：

- **听见**：在乡音流中浏览各地作品，包含方言正文与普通话对照。
- **记录**：通过录音能力采集方言内容，形成个人作品。
- **分享**：生成「乡音宝藏卡」并保存/传播，提升内容扩散效率。

当前代码库以“高保真交互原型 + 可落地后端架构”为目标：前端交互已完整，后端统一规划在 **Supabase（PostgreSQL + Storage + RLS + 可选 Auth）**，用于支撑真实业务数据、权限控制与多端一致性。

## 功能模块构成

### 产品模块

- **乡音流（首页）**：方言内容信息流、互动入口（点赞/评论）、播放态与分享卡入口。
- **发现**：地区探索、百科轮播、热点话题聚合。
- **录制创作**：模式选择（故事/挑战/自由）、按住录音、录后发布。
- **个人中心**：资料与统计、打卡、资产入口（作品/宝藏卡/收藏/成就）。
- **乡音宝藏卡**：模板化视觉卡片生成、保存相册与分享。
- **评论页（占位）**：已补齐可跳转页面，待接入 Supabase 评论能力。

### 文件目录映射（含 Supabase 对接方向）

| 分类 | 文件 | 当前职责（现状） | Supabase 对接方向（建议） |
|------|------|------------------|----------------------------|
| **入口** | `App.vue` | 全局主题、基础样式、按钮与动画基类 | 无直接数据读写；可用于全局登录态 UI 切换 |
| **入口** | `main.js` | 应用创建与挂载入口 | 注入 `supabase client`、全局状态容器 |
| **路由** | `pages.json` | 页面声明与 TabBar 配置 | 无直接对接；新增业务页时同步维护 |
| **平台配置** | `manifest.json` | 权限声明（录音/相册）与平台打包配置 | 间接影响录音上传、相册保存可用性 |
| **首页** | `pages/index/index.vue` | 信息流 mock、播放切换、本地点赞、评论跳转、卡片跳转 | `posts` 列表查询（分页）；`likes` 点赞状态与计数；评论按 `post_id` 跳转；分享参数携带 `post_id` |
| **发现** | `pages/discover/discover.vue` | 地区/百科/话题 mock、轮播逻辑 | `regions` / `topics` / `trivia` 只读查询，支持运营配置 |
| **录制** | `pages/create/create.vue` | 录音权限申请、开始/停止录音、波形动画、临时数据传递 | `Storage(audio)` 上传音频；`posts.insert` 写入作品；回填 `post_id` |
| **个人** | `pages/profile/profile.vue` | 用户资料 mock、统计 mock、本地打卡数组与日历渲染 | `profiles` 获取资料；`check_ins` 打卡与连续天；`posts/likes/follows` 统计聚合 |
| **宝藏卡** | `pages/card/card.vue` | 模板切换、Canvas 绘制、导图、保存与分享 | 从 `posts` 拉取作品并生成卡；`audio` URL 由 Storage public/signed 提供 |
| **评论** | `pages/comment/comment.vue` | 占位页（已可跳转） | `comments` 列表查询 + 新增；关联 `profiles` 显示昵称头像 |
| **组件** | `components/SoundCard/SoundCard.vue` | 单条内容展示、波形播放动效、互动事件派发 | 播放真实 `audio_url`；点赞/评论事件接 services 层 |
| **工具** | `utils/audio.js` | 时长格式化、波形生成、播放器/录音封装 | 播放 Storage URL、上传前格式与大小校验扩展 |
| **工具** | `utils/canvas.js` | 卡片绘制通用能力（圆角、换行、导图） | 可扩展服务端渲染模板参数映射 |
| **数据层（规划）** | `services/README.md`、`services/.gitkeep` | Supabase 数据访问层占位 | 统一封装 `posts / profile / interactions / storage / checkins` |

## 技术路线

### 前端技术栈

- **框架**：Uni-app + Vue 3（Composition API）。
- **录音能力**：`uni.getRecorderManager()`，支持录音开始/停止、临时文件输出。
- **播放能力**：`uni.createInnerAudioContext()`（已在 `utils/audio.js` 封装播放器类）。
- **绘图能力**：`uni.createCanvasContext()` + `uni.canvasToTempFilePath()` 生成分享图。
- **平台权限**：`manifest.json` 中声明 Android 录音/存储权限；小程序 `scope.record` 与相册权限流程。

### 后端架构（Supabase）

**Supabase = PostgreSQL + Storage + Auth（可选）+ RLS**

建议核心表：

- **`profiles`**：用户资料（昵称、头像、地区、简介等），与 `auth.users` 关联。
- **`posts`**：作品主表（内容、翻译、时长、地区、模式、`audio_path`、作者 `user_id`、可见性）。
- **互动表**：`likes`、`comments`、`follows`。
- **打卡成就**：`check_ins`、`user_achievements`。
- **发现域配置**：`regions`、`topics`、`trivia`（可选）。

Storage 策略：

- `audio/`：录音文件（建议按 `user_id/yyyy/mm/uuid` 组织）。
- `avatars/`：头像资源。
- `cards/`（可选）：生成后卡片资源归档。

RLS 原则：

- **读策略**：公开作品可读，私密作品仅作者可读。
- **写策略**：写入仅允许 `auth.uid() = user_id`。
- **互动策略**：点赞/评论/打卡仅允许登录用户写入自己的记录。

### Supabase 建表 SQL 模板

> 以下为示例模板，可根据实际需要增减字段或索引。

```sql
-- profiles：扩展用户资料
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  avatar_url text,
  region text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- posts：乡音作品
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  translation text,
  duration_seconds integer not null check (duration_seconds > 0),
  region text,
  mode text check (mode in ('story','challenge','free')),
  audio_path text not null,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_posts_user_id on public.posts (user_id);
create index if not exists idx_posts_created_at on public.posts (created_at desc);

-- likes：点赞
create table if not exists public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);
create index if not exists idx_likes_post_id on public.likes (post_id);

-- comments：评论
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
create index if not exists idx_comments_post_id_created_at
  on public.comments (post_id, created_at desc);

-- follows：关注关系
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- check_ins：打卡
create table if not exists public.check_ins (
  user_id uuid not null references public.profiles (id) on delete cascade,
  check_date date not null,
  created_at timestamptz default now(),
  primary key (user_id, check_date)
);
create index if not exists idx_check_ins_user_date
  on public.check_ins (user_id, check_date desc);

-- user_achievements：成就解锁记录
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  code text not null,   -- 如 'checkin_7_days'
  unlocked_at timestamptz default now()
);
create index if not exists idx_user_achievements_user
  on public.user_achievements (user_id);
```

### RLS 权限策略样例

> 开启 RLS 后再添加策略；以下为常用读写策略参考。

```sql
-- 开启 RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.check_ins enable row level security;
alter table public.user_achievements enable row level security;

-- profiles：仅本人可写，所有人可读公开字段（示例中简化为全读）
create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  using (true);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- posts：公开作品可读，作者可读写自己的记录
create policy "Public posts are viewable by everyone"
  on public.posts
  for select
  using (is_public = true or auth.uid() = user_id);

create policy "Users can insert their own posts"
  on public.posts
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts
  for update
  using (auth.uid() = user_id);

-- likes：用户只能操作自己的点赞
create policy "Users manage their own likes"
  on public.likes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- comments：公开作品下的评论可读；用户只能写自己的评论
create policy "Comments readable on public posts"
  on public.comments
  for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and (p.is_public = true or p.user_id = auth.uid())
    )
  );

create policy "Users can insert their own comments"
  on public.comments
  for insert
  with check (auth.uid() = user_id);

-- follows：关注关系仅本人可管理
create policy "Users manage their own follows"
  on public.follows
  for all
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

-- check_ins：用户仅能读写自己的打卡
create policy "Users manage their own check_ins"
  on public.check_ins
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_achievements：仅本人可见
create policy "Users see their own achievements"
  on public.user_achievements
  for select
  using (auth.uid() = user_id);
```

### services/ API 命名规范与基础结构

> 目标：前端只与 `services/*` 交互，隐藏 Supabase 实现细节，方法命名统一、语义清晰。

- **命名规范**：
  - 列表查询：`listXxx`（如 `listPosts`、`listCommentsByPost`）
  - 获取单条：`getXxxById`
  - 创建：`createXxx`
  - 更新：`updateXxx`
  - 删除/取消：`deleteXxx` / `cancelXxx`
  - 状态切换：`toggleXxx`（如点赞）

- **推荐文件结构**：

```text
services/
├── supabaseClient.js   # 创建并导出单例 supabase client
├── posts.js            # listPosts / getPostById / createPost / deletePost
├── profile.js          # getCurrentProfile / updateProfile
├── interactions.js     # toggleLike / listLikesByPost / listCommentsByPost / createComment / followUser / unfollowUser
├── checkins.js         # checkInToday / listCheckInsByMonth / listAchievements
└── storage.js          # uploadAudio / uploadAvatar / getPublicUrl
```

- **示例：`supabaseClient.js`（伪代码）**

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- **示例：`posts.js`（伪代码）**

```js
import { supabase } from './supabaseClient'

export async function listPosts({ page = 1, pageSize = 10 } = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return supabase
    .from('posts')
    .select('*, profiles!inner(nickname, avatar_url, region)')
    .range(from, to)
    .order('created_at', { ascending: false })
}

export async function createPost(payload) {
  return supabase.from('posts').insert(payload).single()
}
```

## UI 风格规范

设计规范来自 `App.vue` 与各页面 SCSS，统一为“暖色文化感”体系：

### 色彩规范

- **背景米白**：`#F5F1E8`，页面浅渐变到 `#EDE8DC`。
- **主色森林绿**：`#2D5016` / `#4A7C2A`（标题、Tab 选中、波形激活）。
- **强调琥珀橙**：`#E67E22` / `#D35400`（主按钮、录制、生成、打卡）。
- **点缀酒红**：`#8B2635`（录音中态、点赞激活、传统卡模板）。
- **文字灰阶**：主文 `#3E3E3E`、次文 `#666666`、弱化 `#9E9E9E`。

### 组件与动效规范

- **卡片**：白底 + 大圆角（24~28rpx）+ 轻阴影（`rgba(0,0,0,0.06~0.08)`）。
- **按钮反馈**：按压态 `scale(0.98)` + 透明度变化。
- **音频表达**：波形条（`wave`）动效表达播放与录制状态。
- **强调动效**：`pulse` 用于录制中提示与焦点反馈。
- **图标策略**：以 emoji 作为轻量图形语言，减少跨端资源适配复杂度。

## 代码结构优化（已执行）

已完成以下结构优化：

1. **补全 `comment` 页面占位**
   - 新增：`pages/comment/comment.vue`
   - 路由已加入：`pages.json`
   - 作用：避免首页评论跳转报错，并作为 Supabase 评论功能接入锚点。

2. **补充 `services/` 目录规划**
   - 新增：`services/README.md`、`services/.gitkeep`
   - 作用：作为未来数据访问层统一入口，避免页面直接耦合数据库细节。

推荐后续结构：

```text
services/
├── supabaseClient.js      # client 初始化
├── posts.js               # 作品查询/发布
├── profile.js             # 用户资料
├── interactions.js        # 点赞/评论/关注
├── checkins.js            # 打卡/成就
└── storage.js             # 音频与头像上传
```

## mock 数据迁移到 Supabase（实施流程）

### 步骤 1：后端准备

- 创建 Supabase 项目与数据库。
- 建立表：`profiles / posts / likes / comments / follows / check_ins / user_achievements`。
- 创建 Storage bucket：`audio`、`avatars`（可选 `cards`）。
- 配置 RLS 读写策略与必要索引（`post_id`、`user_id`、`created_at`）。

### 步骤 2：抽离数据层

在 `services/` 实现 API 封装，页面仅调用方法，不直接写 SQL/REST。

示例职责：

- `posts.list(page)`：首页分页列表。
- `posts.create(payload)`：录音发布。
- `storage.uploadAudio(tempFilePath)`：本地临时音频上传。
- `comments.list(postId)` / `comments.create(postId, content)`：评论读写。
- `checkins.checkIn(date)`：打卡写入与连续天计算。

### 步骤 3：逐页替换 mock

- **首页**：`audioList` 由 `posts.list()` 结果替换；点赞改成 `likes` 持久化。
- **发现**：地区/话题/百科由 Supabase 配置表驱动。
- **录制**：停止录音后上传 Storage，再写 `posts`。
- **个人**：用户资料、统计、打卡全部来自 `profiles/check_ins`。
- **评论**：占位页升级为真实评论列表与发布页。

### 步骤 4：联调验收

- 真实作品可发布、可播放、可展示。
- 点赞/评论/打卡跨设备一致。
- 无登录用户受 RLS 限制，不能越权写入。

## 快速开始

1. 安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html) 或 VS Code + Uni-app 插件，并安装 [Node.js](https://nodejs.org/)。
2. 导入项目目录 `xiangyin-app`。
3. 运行到浏览器或微信开发者工具。
4. 接入 Supabase 时配置 `SUPABASE_URL` 与 `SUPABASE_ANON_KEY`（**禁止在客户端使用 service role key**）。

## 许可证

本项目采用 [MIT License](LICENSE) 开源。

---

*听见乡音，记住乡愁。*
# 乡音 (Xiangyin)

**听见一方水土，留住一缕乡音**

## 项目简介

**乡音** 是一款基于 **Uni-app（Vue 3）** 的方言文化记录与分享应用。用户可浏览各地乡音内容、录制并发布自己的声音，并将作品生成可分享的「乡音宝藏卡」。当前客户端已实现录音、卡片绘制、信息流与发现页等完整交互原型；**业务数据规划统一落在 Supabase**（PostgreSQL + 对象存储 + 可选鉴权），便于多端一致与后续扩展。

## 功能模块构成

| 模块 | 路由 / 组件 | 职责说明 |
|------|-------------|----------|
| **乡音流（首页）** | `pages/index/index.vue`、`components/SoundCard/SoundCard.vue` | 竖向信息流：用户信息、方言正文、普通话对照、波形与时长展示、点赞/评论入口、跳转宝藏卡；**规划**从 Supabase 拉取帖子列表与互动计数。 |
| **发现** | `pages/discover/discover.vue` | 方言地图入口、热门地区网格、方言小百科轮播、热门话题列表；**规划**地区/话题/百科数据由后台表或 CMS 配置驱动。 |
| **录制创作** | `pages/create/create.vue` | 三种模式（方言故事 / 趣味挑战 / 自由录制）、按住录音、`RecorderManager` 产出临时音频；**规划**上传至 Supabase Storage 后写入作品元数据。 |
| **个人中心** | `pages/profile/profile.vue` | 资料卡、作品/获赞/关注/粉丝、每日打卡日历、作品/宝藏卡/收藏/成就入口；**规划**与用户表、打卡记录表、关注关系表对接。 |
| **乡音宝藏卡** | `pages/card/card.vue`、`utils/canvas.js` | 多模板渐变卡片、`canvas` 绘制文案与装饰、导出图片、保存相册与分享；**规划**卡片关联作品 ID，分享链接可解析至公开音频。 |
| **音频与媒体工具** | `utils/audio.js` | 时长格式化、波形模拟数据、`AudioPlayer` / `AudioRecorder` 封装；**规划**播放真实 URL（Storage 公共或签名 URL）。 |

**说明**：首页评论跳转 `pages/comment/comment` 尚未在仓库中实现，属产品预留接口，接入 Supabase 时可一并补全评论表与页面。

## 技术路线

### 客户端

- **框架**：[Uni-app](https://uniapp.dcloud.net.cn/)，**Vue 3** + Composition API（`createSSRApp`）。
- **语言与样式**：JavaScript、SCSS；全局样式与主题变量集中在 `App.vue`。
- **端能力**：`uni.getRecorderManager` 录音、`uni.createInnerAudioContext`播放（工具类已封装）、`uni.createCanvasContext` 生成分享图；微信小程序等端需配置录音与相册权限（见 `manifest.json`）。

### 后端与数据（Supabase）

采用 **Supabase** 作为唯一后端：**Auth**（可选，微信登录可配合云函数或自定义 JWT）、**PostgreSQL** 存业务实体、**Storage** 存音频与头像、**Row Level Security (RLS)** 控制读写边界。

建议能力划分：

1. **身份与用户**：`profiles`（扩展 `auth.users`：昵称、头像、地区、简介、统计冗余字段等）。
2. **内容**：`posts`（正文、翻译、时长、`audio_path`、地区标签、创作模式、作者 `user_id`、可见性）。
3. **互动**：`likes`、`comments`（或聚合统计字段 + 明细表，按性能取舍）；`follows`（关注关系）。
4. **发现域**：`regions`、`topics`、`trivia`（百科条目）或由运营在表中维护；首页/发现页只读查询。
5. **打卡与成就**：`check_ins`、`user_achievements`（与个人页日历、徽章对应）。
6. **存储桶**：例如 `audio`（录音文件）、`avatars`（头像）、可选 `cards`（服务端生成封面时）。

客户端通过 **Supabase JS客户端**（需注意 Uni-app 各端对 `fetch` / 适配器的要求）或 **REST +服务端签名 URL** 访问；敏感写操作必须在 RLS 策略下绑定 `auth.uid()`。

### 与当前代码的衔接方式

- 将各页 `ref([...])` 中的 mock 数据替换为 **API 层**（如 `services/supabase.js`）：列表分页、单条详情、上传 `multipart` 或先拿 Storage 上传凭证再 `insert`。
- 录音结束：`tempFilePath` → **Storage 上传** → 返回 `public`或带过期时间的 URL → 写入 `posts`。
- 宝藏卡页：除本地 `cardData` 外，可增加 **作品 ID**，分享参数用于 H5/小程序打开对应帖子。

## UI 风格与设计语言

- **气质**：温暖、文化感、偏「纸本 / 故土」调性，避免冷色科技风。
- **背景**：米白偏暖（如 `#F5F1E8`）、浅渐变至 `#EDE8DC`，列表与页面统一轻渐变底。
- **主色（森林绿）**：`#2D5016` / `#4A7C2A` — 用于标题强调、Tab 选中、主按钮辅色、波形高亮与地域标签。
- **强调色（琥珀橙）**：`#E67E22` / `#D35400` — 主操作（录制按钮、生成卡片、打卡）、选中描边与强调状态。
- **点缀色（酒红）**：`#8B2635` — 录音中状态、传统风卡片模板、点赞激活等情绪强调。
- **文字**：主文 `#3E3E3E`，次级 `#666666`，弱化 `#9E9E9E`。
- **组件**：白底卡片、`24rpx~28rpx` 大圆角、轻阴影（`rgba(0,0,0,0.06~0.08)`）；操作反馈为 `scale(0.98)` 与透明度变化。
- **图形**：大量使用 **emoji** 作为轻量图标（地图、地区、菜单）；音频区用 **竖条波形** 动画强化「可听」感知。
- **导航**：底部 Tab 四栏 — 首页 / 发现 / 录制 / 我的；顶部导航栏背景与页面底色一致（`#F5F1E8`）。

## 目录结构

```text
xiangyin-app/
├── components/              # 业务组件
│   └── SoundCard/           # 乡音信息流卡片
├── pages/
│   ├── index/               # 乡音流
│   ├── discover/            # 发现
│   ├── create/              # 录制
│   ├── profile/             # 我的
│   └── card/                # 乡音宝藏卡
├── static/                  # 静态资源（Tab 图标、头像等）
├── utils/
│   ├── audio.js             # 音频时长、波形、播放器/录音封装
│   └── canvas.js            # 圆角矩形、换行文本等绘图工具
├── App.vue                  # 全局样式与主题
├── main.js                  # 应用入口
├── manifest.json            # App / 小程序权限与配置
└── pages.json               # 路由与 TabBar
```

（后续可增加 `services/`、`stores/`、`supabase/` 等目录，与 README 中 Supabase 规划保持一致。）

## 快速开始

1. 安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html) 或 VS Code + Uni-app 插件，并安装 [Node.js](https://nodejs.org/)。
2. 用 HBuilderX 导入本项目目录 `xiangyin-app`。
3. 菜单 **运行** → 选择 **浏览器** 或 **微信开发者工具** 等目标端。
4. 接入 Supabase 后：在项目中配置 `SUPABASE_URL` 与 `SUPABASE_ANON_KEY`（勿将 service role key 写入客户端），并按上表创建表、存储桶与 RLS 策略。

## 许可证

本项目采用 [MIT License](LICENSE) 开源。

---

*听见乡音，记住乡愁。*
