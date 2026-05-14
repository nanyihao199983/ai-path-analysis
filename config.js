/**
 * AI 路子分析系统 - 全局配置
 * 所有可变参数集中管理，换号/改名只需改这里
 */
const CONFIG = {
  // 联系方式（底部显示 + 复制功能）
  contact: {
    id: '142078040',
    label: '蝙蝠号',
    hint: '添加技术员获取实时监控'
  },

  // 系统信息
  system: {
    name: 'AI 路子大数据分析',
    version: '1324 实战版 v4.0',
    server: '大其力算力中心'
  },

  // 1324 打法比例
  ratios: [1, 3, 2, 4],

  // 分析配置
  analysis: {
    minHistory: 5,
    maxHistory: 30,
    defaultHistory: 10,
    predictionCount: 4
  },

  // 分享裂变配置
  share: {
    required: 3,
    hint: '转发至 3 个群解锁后续必中参数'
  }
};
