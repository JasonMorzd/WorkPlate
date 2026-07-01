# 工作看板 (Work Kanban) 实施计划

## 一、项目概述

构建一个纯前端的工作看板单页应用，页面被不同颜色的任务窗口铺满。每个任务窗口代表一个待记录事项，窗口大小由重要程度（0-100）决定，颜色饱和度随进度递减，支持文本/表单输入。简约风格，丝滑动效。

### 技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS 3
- **状态管理**: Zustand
- **图标**: lucide-react
- **数据持久化**: localStorage
- **路由**: 单页应用，无需 react-router-dom

## 二、数据模型

```typescript
interface Task {
  id: string;
  title: string;
  importance: number;       // 0-100, 重要程度
  progress: number;         // 0-100 进度条, -1 表示长期任务, 101 表示已完成
  hue: number;              // HSL 色相值 (0-360)，决定任务颜色
  content: TaskContent;     // 任务内容
  isPinned: boolean;        // 是否置顶到左上角
  createdAt: number;        // 创建时间戳
}

type TaskContent = TextContent | FormContent;

interface TextContent {
  type: 'text';
  text: string;
}

interface FormContent {
  type: 'form';
  fields: FormField[];
}

interface FormField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: string[];       // select 类型时的选项
}
```

## 三、功能模块 & 组件树

### 组件层级
```
App
├── Header                          # 顶部栏：标题 + 添加任务按钮
├── TaskGrid                        # 任务网格容器
│   └── TaskCard (多个)              # 单个任务卡片
│       ├── TaskCardHeader          # 折叠态：仅显示标题 + 进度指示
│       └── TaskCardDetail          # 展开态：完整内容
│           ├── TaskContentText     # 文本内容编辑
│           ├── TaskContentForm     # 表单内容编辑
│           └── TaskControls        # 进度控制、置顶、删除等操作
└── FrostedOverlay                  # 展开时的毛玻璃背景层
    └── TaskCardDetail              # 在 overlay 中展开的任务详情
```

### 全局状态 (Zustand Store)

```typescript
interface TaskStore {
  tasks: Task[];
  expandedTaskId: string | null;    // 当前展开的任务ID
  addTask: () => void;
  updateTask: (id: string, partial: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setExpandedTask: (id: string | null) => void;
  togglePin: (id: string) => void;
}
```

## 四、核心逻辑实现

### 4.1 重要程度分配算法
- 第一条任务默认 importance = 100（铺满页面）
- 添加新任务且未修改重要程度时，将所有现有任务的重要程度按比例平分，新任务默认值 = 平均值
- 例如: 现有 [100]，加新任务 → [50, 50]；再加一个 → [33, 33, 34]

### 4.2 布局算法
- 计算所有任务 importance 总和
- 每个任务占据面积比例 = importance / total
- 排序规则：isPinned → true 的排在最前面，然后按 importance 降序
- 布局方向：从左到右、从上到下（左上角最高优先级）
- 使用 CSS Grid 实现动态布局
- 窗口大小变化时使用 CSS `transition: all 0.5s cubic-bezier(...)` 实现丝滑动效

### 4.3 颜色饱和度算法
- 任务创建时分配一个固定的色相（hue）
- 饱和度 = 100% - (progress / 100) * 80%
  - progress = 0 → 饱和度 100%（鲜艳）
  - progress = 50 → 饱和度 60%
  - progress = 100 → 饱和度 20%（接近灰色）
- 长期任务（progress = -1）: 使用较低的初始饱和度 70%，维持稳定
- 已完成（progress = 101）: 饱和度固定为 0%（纯灰色）
- HSL 表示: `hsl(${hue}, ${saturation}%, ${lightness}%)`

### 4.4 展开/折叠交互
- 默认折叠态：只显示任务标题，背景使用对应颜色的半透明版本
- 点击任务卡片 → 展开详情，同时触发毛玻璃背景层
- 毛玻璃层使用 `backdrop-filter: blur(20px)` + `背景颜色半透明遮罩`
- 点击毛玻璃层或关闭按钮 → 收起，回到网格视图
- 展开/收起使用 transition 实现平滑过渡

### 4.5 进度模式
- 三种进度模式：
  - **进度条** (progress 0-100)：显示可拖动的进度条
  - **长期任务** (progress = -1)：显示「长期」标签
  - **已完成** (progress = 101)：显示「✓ 已完成」标签，颜色变灰

## 五、UI 设计

### 设计风格
- **风格定位**: 简约、干净、带色彩的信息面板
- **字体**: 
  - 标题字体: "Noto Sans SC" 或系统无衬线字体
  - 使用 Google Fonts 加载
- **颜色方案**: 
  - 背景: #0a0a0a 或 #f5f5f5（深色/浅色可选，推荐深色）
  - 任务卡片颜色由用户分配的 hue 动态生成
  - 文本: 白色或深灰色
- **毛玻璃效果**:
  - backdrop-filter: blur(24px) saturate(180%)
  - 背景半透明遮罩
- **动效**:
  - 卡片尺寸变化: transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)
  - 展开/折叠: transform + scale + opacity 组合动画
  - 新任务添加: 从中心缩放出现

### 页面布局
```
┌─────────────────────────────────────────────┐
│  Header: 工作看板标题  [+ 添加任务]          │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐              │
│  │任务A  │  │任务B  │  │任务C  │              │
│  │重要100│  │重要60 │  │重要40 │              │
│  │🟢80%  │  │🟡50%  │  │🔴20%  │              │
│  └──────┘  └──────┘  └──────┘              │
│              ┌──────┐                       │
│              │任务D  │                       │
│              │重要30 │                       │
│              │ 长期  │                       │
│              └──────┘                       │
│                                             │
└─────────────────────────────────────────────┘
```

## 六、目录结构

```
work-kanban/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                    # Tailwind 基础 + 全局样式
│   ├── store/
│   │   └── useTaskStore.ts          # Zustand store
│   ├── utils/
│   │   ├── colorUtils.ts            # 颜色饱和度计算
│   │   ├── layoutUtils.ts           # 布局/重要程度分配
│   │   └── storageUtils.ts          # localStorage 读写
│   ├── components/
│   │   ├── TaskGrid.tsx             # 网格容器
│   │   ├── TaskCard.tsx             # 任务卡片（折叠态）
│   │   ├── TaskCardDetail.tsx       # 任务详情（展开态）
│   │   ├── TaskProgress.tsx         # 进度控制组件
│   │   ├── TaskContentText.tsx      # 文本内容编辑
│   │   ├── TaskContentForm.tsx      # 表单内容编辑
│   │   ├── FrostedOverlay.tsx       # 毛玻璃遮罩层
│   │   └── Header.tsx               # 顶部栏
│   ├── hooks/
│   │   └── useAutoSave.ts           # 自动保存到 localStorage
│   └── types/
│       └── index.ts                 # 类型定义
```

## 七、实施步骤

### Step 1: 项目初始化
- 使用 `pnpm create vite-init@latest` 以 `react-ts` 模板创建项目
- 安装依赖（已包含 react, react-router-dom, tailwind, zustand）
- 移除不需要的 react-router-dom，配置 tailwind

### Step 2: 类型定义与工具函数
- 创建 `src/types/index.ts`（Task, TaskContent, FormField 等类型）
- 创建 `src/utils/colorUtils.ts`（根据 progress 计算饱和度）
- 创建 `src/utils/layoutUtils.ts`（重要程度分配算法）
- 创建 `src/utils/storageUtils.ts`（localStorage 读写封装）

### Step 3: Zustand 状态管理
- 创建 `src/store/useTaskStore.ts`
- 实现 addTask, updateTask, removeTask, setExpandedTask, togglePin
- 集成 localStorage 持久化

### Step 4: UI 组件开发（从内到外）
- 创建通用小组件：TaskProgress, TaskContentText, TaskContentForm
- 创建 TaskCard（折叠态）和 TaskCardDetail（展开态）
- 创建 FrostedOverlay 毛玻璃组件
- 创建 Header
- 创建 TaskGrid 网格布局

### Step 5: App 主页面集成
- 组合所有组件到 App.tsx
- 实现初始化示例数据（展示 4-5 个不同颜色/大小的示例任务）
- 实现全局样式和字体加载

### Step 6: 动效与细节打磨
- CSS transition 配置丝滑动画
- 展开/折叠动画
- 添加新任务动画
- 颜色饱和度过渡效果

### Step 7: 验证与优化
- `npm run build` 确保构建无误
- `npm run dev` 启动预览
- 本地测试所有交互流程

## 八、假设与决策

| 决策项 | 选择 | 原因 |
|--------|------|------|
| 深色/浅色主题 | 深色主题 | 色彩信息面板在深色背景下更突出，毛玻璃效果更明显 |
| 路由 | 无路由（单页） | 单页看板应用，无需多页面 |
| 数据持久化 | localStorage | 纯前端方案，零后端依赖 |
| 任务颜色分配 | 创建时随机分配色相 | 保证每个任务颜色不同 |
| 字体 | Google Fonts (Noto Sans SC) | 中文字体渲染效果好 |
| 动画曲线 | cubic-bezier(0.34, 1.56, 0.64, 1) | 弹性回弹效果，视觉上丝滑 |

## 九、验证方式
1. `npm run dev` 启动开发服务器，预览页面
2. 测试添加任务、修改重要程度、调整进度
3. 验证布局算法（新任务平分重要程度）
4. 验证颜色饱和度变化（进度增加 → 颜色变灰）
5. 验证展开/折叠 + 毛玻璃效果
6. 验证置顶功能
7. 刷新页面确认 localStorage 持久化
8. `npm run build` 确认生产构建成功
