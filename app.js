// 状态管理
const state = {
  slots: Array(10).fill(null),
  shareCount: 0,
  predictions: [],
  currentPhase: 'input'
};

// DOM 元素
const slotsContainer = document.getElementById('slots');
const analyzeBtn = document.getElementById('analyze-btn');
const slotCount = document.getElementById('slot-count');
const inputLayer = document.getElementById('input-layer');
const processingLayer = document.getElementById('processing-layer');
const predictionLayer = document.getElementById('prediction-layer');
const unlockedLayer = document.getElementById('unlocked-layer');
const progressBar = document.getElementById('progress');
const logContainer = document.getElementById('log');
const overlay = document.getElementById('overlay');
const shareBtn = document.getElementById('share-btn');
const shareCount = document.getElementById('share-count');
const predictionsContainer = document.getElementById('predictions');
const fullPredictionsContainer = document.getElementById('full-predictions');
const copyBtn = document.getElementById('copy-btn');

// 初始化槽位
function initSlots() {
  for (let i = 0; i < 10; i++) {
    const slot = document.createElement('div');
    slot.classList.add('slot');
    slot.dataset.index = i;
    slot.textContent = i + 1;
    slot.addEventListener('click', () => handleSlotClick(i));
    slotsContainer.appendChild(slot);
  }
}

// 槽位点击逻辑
function handleSlotClick(index) {
  const slot = slotsContainer.children[index];
  const currentState = state.slots[index];
  
  if (currentState === null) {
    state.slots[index] = 'banker';
    slot.classList.add('banker');
    slot.textContent = '庄';
  } else if (currentState === 'banker') {
    state.slots[index] = 'player';
    slot.classList.remove('banker');
    slot.classList.add('player');
    slot.textContent = '闲';
  } else {
    state.slots[index] = null;
    slot.classList.remove('player');
    slot.textContent = index + 1;
  }
  
  updateSlotCount();
}

// 更新计数
function updateSlotCount() {
  const filledSlots = state.slots.filter(s => s !== null).length;
  slotCount.textContent = filledSlots;
  analyzeBtn.disabled = filledSlots < 5;
}

// 生成预测结果
function generatePredictions() {
  const outcomes = ['banker', 'player'];
  const predictions = [];
  const baseAmount = 100;
  
  for (let i = 0; i < 4; i++) {
    const outcome = outcomes[Math.floor(Math.random() * 2)];
    const winRate = Math.floor(Math.random() * 11) + 85; // 85-95
    const amount = baseAmount * [1, 3, 2, 4][i]; // 1324 打法
    
    predictions.push({
      outcome,
      winRate,
      amount,
      label: `第 ${i + 1} 局`
    });
  }
  
  return predictions;
}

// 渲染预测
function renderPredictions(predictions, container, limit = null) {
  container.innerHTML = '';
  const itemsToShow = limit ? predictions.slice(0, limit) : predictions;
  
  itemsToShow.forEach((pred, idx) => {
    const item = document.createElement('div');
    item.className = `prediction-item ${pred.outcome}`;
    item.innerHTML = `
      <div class="pred-header">
        <span class="pred-label ${pred.outcome}">${pred.label}: ${pred.outcome === 'banker' ? '庄' : '闲'}</span>
        <span class="pred-amount">投注: ¥${pred.amount}</span>
      </div>
      <div class="win-rate-container">
        <span style="color: #888; font-size: 12px;">胜率</span>
        <div class="win-rate-bar">
          <div class="win-rate-fill" style="width: ${pred.winRate}%"></div>
        </div>
        <span class="win-rate-text">${pred.winRate}%</span>
      </div>
    `;
    container.appendChild(item);
  });
}

// AI 建模动画
async function runAnalysis() {
  inputLayer.classList.add('hidden');
  processingLayer.classList.remove('hidden');
  
  const logMessages = [
    { text: '正在连接大其力算力中心...', delay: 300 },
    { text: '正在匹配 1324 复利模型...', delay: 600 },
    { text: '正在分析历史路子数据...', delay: 900 },
    { text: 'AI 深度学习建模中...', delay: 1200 },
    { text: '胜率计算完成 ✓', delay: 1500, success: true },
    { text: '预测参数已生成', delay: 1800 },
    { text: '分析完成', delay: 2100, success: true }
  ];
  
  for (const msg of logMessages) {
    await delay(msg.delay - (logMessages.indexOf(msg) > 0 ? logMessages[logMessages.indexOf(msg) - 1].delay : 0));
    const line = document.createElement('div');
    line.className = `log-line ${msg.success ? 'success' : ''}`;
    line.textContent = `> ${msg.text}`;
    logContainer.appendChild(line);
    
    const progress = ((logMessages.indexOf(msg) + 1) / logMessages.length) * 100;
    progressBar.style.width = `${progress}%`;
  }
  
  await delay(1400);
  
  state.predictions = generatePredictions();
  showPredictions();
}

// 显示预测
function showPredictions() {
  processingLayer.classList.add('hidden');
  predictionLayer.classList.remove('hidden');
  
  renderPredictions(state.predictions, predictionsContainer);
  
  // 第2局后触发裂变拦截
  setTimeout(() => {
    if (state.shareCount < 3) {
      overlay.classList.remove('hidden');
    }
  }, 2000);
}

// 分享逻辑
shareBtn.addEventListener('click', () => {
  state.shareCount++;
  shareCount.textContent = state.shareCount;
  
  if (state.shareCount >= 3) {
    setTimeout(() => {
      overlay.classList.add('hidden');
      showUnlockedResults();
    }, 500);
  }
});

// 显示完整结果
function showUnlockedResults() {
  predictionLayer.classList.add('hidden');
  unlockedLayer.classList.remove('hidden');
  renderPredictions(state.predictions, fullPredictionsContainer);
  
  // 自动复制蝙蝠号
  copyToClipboard('142078040');
  showToast('参数已解锁，请添加蝙蝠号获取实时监控。');
}

// 复制功能
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// Toast 提示
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #00ff00;
    color: #000;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    z-index: 1000;
    animation: fadeIn 0.3s;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// 复制按钮
copyBtn.addEventListener('click', () => {
  copyToClipboard('142078040');
  showToast('蝙蝠号已复制到剪贴板');
});

// 延迟工具函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 分析按钮
analyzeBtn.addEventListener('click', () => {
  if (state.slots.filter(s => s !== null).length >= 5) {
    runAnalysis();
  }
});

// 初始化
initSlots();
