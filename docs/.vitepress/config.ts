import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AI-Fullstack-Notes',
  description: '全栈工程师的 AI/Agent 学习笔记',
  base: '/AI-Fullstack-Notes/',
  head: [
    ['link', { rel: 'icon', href: '/AI-Fullstack-Notes/favicon.ico' }]
  ],
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      link: '/zh/'
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/'
    }
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'AI-Fullstack-Notes',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Eva-Dengyh/AI-Fullstack-Notes' }
    ],
    locales: {
      root: {
        label: '中文',
        selectText: '选择语言',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        darkModeSwitchLabel: '主题',
        docFooter: {
          prev: '上一页',
          next: '下一页'
        },
        nav: [
          { text: '首页', link: '/zh/' },
          { text: 'AI / Agent', link: '/zh/ai/langchain-architecture' },
          { text: '后端架构', link: '/zh/backend/high-concurrency-architecture' },
          { text: '基础设施', link: '/zh/infra/docker-basics-dockerfile' },
          { text: '项目实战', link: '/zh/projects/hermes-agent/' },
        ],
        sidebar: {
          '/zh/': [
            {
              text: 'AI / Agent',
              items: [
                { text: 'LangChain 架构浅析', link: '/zh/ai/langchain-architecture' },
                { text: 'LangGraph — 通过图结构重新定义 LLM 应用', link: '/zh/ai/langgraph-intro' },
                { text: 'RAG 实战：从手写 MVP 到生产级优化', link: '/zh/ai/rag-mvp-to-production' },
                { text: 'AI Agent 开发：零基础构建复合智能体', link: '/zh/ai/ai-agent-dev-composite-agent' },
                { text: 'Claude Code CLI 快速上手', link: '/zh/ai/claude-code-quickstart' },
                { text: 'Codex Plugin 与 Claude Code', link: '/zh/ai/codex-plugin-claude-code' },
              ]
            },
            {
              text: '后端架构',
              items: [
                { text: '高并发架构设计思考', link: '/zh/backend/high-concurrency-architecture' },
                { text: 'Nginx 全解析：反向代理与负载均衡', link: '/zh/backend/nginx-reverse-proxy-load-balance' },
                { text: 'Redis 分布式缓存核心问答', link: '/zh/backend/redis-cache-core-qa' },
              ]
            },
            {
              text: '基础设施',
              items: [
                { text: 'Docker 基础与 Dockerfile 编写', link: '/zh/infra/docker-basics-dockerfile' },
                { text: 'Docker Compose vs Docker Swarm', link: '/zh/infra/docker-compose-vs-swarm' },
                { text: '5 分钟用 Docker 自建 Supabase', link: '/zh/infra/supabase-docker-self-host' },
                { text: 'Ubuntu 安装 Redis 与远程连接配置', link: '/zh/infra/ubuntu-redis-install-remote-config' },
                { text: 'SSH 公钥认证配置', link: '/zh/infra/ssh-public-key-auth' },
              ]
            },
            {
              text: '项目实战',
              items: [
                { text: 'FastSAM-Demo V1 — SAM 2.1 全栈图像分割', link: '/zh/projects/fastsam-demo-v1-fullstack' },
                { text: 'FastSAM-Demo V2 — Docker 部署与导出功能', link: '/zh/projects/fastsam-demo-v2-docker-export' },
                { text: 'GitHub Profile README 搭建指南', link: '/zh/projects/github-profile-readme-guide' },
                {
                  text: 'Hermes Agent',
                  collapsed: false,
                  items: [
                    { text: '简介', link: '/zh/projects/hermes-agent/' },
                    { text: '本地启动与项目结构', link: '/zh/projects/hermes-agent/01-setup-and-project-structure' },
                  ]
                }
              ]
            }
          ]
        }
      },
      en: {
        label: 'English',
        selectText: 'Languages',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Back to top',
        darkModeSwitchLabel: 'Theme',
        docFooter: {
          prev: 'Previous',
          next: 'Next'
        },
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'AI / Agent', link: '/en/ai/langchain-architecture' },
          { text: 'Backend', link: '/en/backend/high-concurrency-architecture' },
          { text: 'Infrastructure', link: '/en/infra/docker-basics-dockerfile' },
          { text: 'Projects', link: '/en/projects/hermes-agent/' },
        ],
        sidebar: {
          '/en/': [
            {
              text: 'AI / Agent',
              items: [
                { text: 'LangChain Architecture', link: '/en/ai/langchain-architecture' },
                { text: 'LangGraph — Redefining LLM Apps with Graph Structure', link: '/en/ai/langgraph-intro' },
                { text: 'RAG in Practice: From MVP to Production', link: '/en/ai/rag-mvp-to-production' },
                { text: 'AI Agent Development: Building Composite Agents from Scratch', link: '/en/ai/ai-agent-dev-composite-agent' },
                { text: 'Claude Code CLI Quick Start', link: '/en/ai/claude-code-quickstart' },
                { text: 'Codex Plugin & Claude Code', link: '/en/ai/codex-plugin-claude-code' },
              ]
            },
            {
              text: 'Backend Architecture',
              items: [
                { text: 'High Concurrency Architecture Design', link: '/en/backend/high-concurrency-architecture' },
                { text: 'Nginx Complete Guide: Reverse Proxy & Load Balancing', link: '/en/backend/nginx-reverse-proxy-load-balance' },
                { text: 'Redis Distributed Cache Q&A', link: '/en/backend/redis-cache-core-qa' },
              ]
            },
            {
              text: 'Infrastructure',
              items: [
                { text: 'Docker Basics & Dockerfile Writing', link: '/en/infra/docker-basics-dockerfile' },
                { text: 'Docker Compose vs Docker Swarm', link: '/en/infra/docker-compose-vs-swarm' },
                { text: 'Self-host Supabase with Docker in 5 Minutes', link: '/en/infra/supabase-docker-self-host' },
                { text: 'Ubuntu Redis Installation & Remote Config', link: '/en/infra/ubuntu-redis-install-remote-config' },
                { text: 'SSH Public Key Authentication', link: '/en/infra/ssh-public-key-auth' },
              ]
            },
            {
              text: 'Projects',
              items: [
                { text: 'FastSAM-Demo V1 — Full Stack Image Segmentation', link: '/en/projects/fastsam-demo-v1-fullstack' },
                { text: 'FastSAM-Demo V2 — Docker Deployment & Export', link: '/en/projects/fastsam-demo-v2-docker-export' },
                { text: 'GitHub Profile README Guide', link: '/en/projects/github-profile-readme-guide' },
                {
                  text: 'Hermes Agent',
                  collapsed: false,
                  items: [
                    { text: 'Overview', link: '/en/projects/hermes-agent/' },
                    { text: 'Local Setup & Project Structure', link: '/en/projects/hermes-agent/01-setup-and-project-structure' },
                  ]
                }
              ]
            }
          ]
        }
      }
    }
  }
})
