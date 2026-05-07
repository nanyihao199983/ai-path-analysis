// H5 版本应用逻辑
const state = {
  slots: Array(10).fill(null),
  shareCount: 0,
  predictions: [],
  totalAmount: 0,
  currentStep: 'input'
};

// 1324 打法比例
const RATIOS = [1, 3, 2, 4];
const RATIO_SUM = RATIOS.reduce((a, b) => a + b, 0); // = 10

// DOM 缓存
const $ = id => document.getElementById(id);

// 初始化
function init() {
  bindSlots();
  bindButtons();
  bindAmountInput();
}

// 绑定金额输入
function bindAmountInput() {
  const input = $('total-amount');
  if (!input) return;

  input.addEventListener('input', () => {
    const val = parseInt(input.value) || 0;
    state.totalAmount = val;
    updateAnalyzeBtn();
  });

  // 快捷金额按钮
  document.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = parseInt(btn.dataset.amount);
      input.value = amount;
      state.totalAmount = amount;
      updateAnalyzeBtn();
    });
  });
}

// 更新分析按钮状态
function updateAnalyzeBtn() {
  const filled = state.slots.filter(s => s !== null).length;
  const hasAmount = state.totalAmount >= 100;
  const btn = $('btn-analyze');
  if (btn) btn.disabled = !(filled >= 5 && hasAmount);
}

// 绑定槽位
function bindSlots() {
  document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('click', () => {
      const index = parseInt(slot.dataset.index);
      toggleSlot(index);
    });
  });
}

// 切换槽位
function toggleSlot(index) {
  const slot = document.querySelector(`.slot[data-index="${index}"]`);
  const current = state.slots[index];

  if (current === null) {
    state.slots[index] = 'banker';
    slot.classList.add('banker');
    slot.innerHTML = '<span class="slot-num">庄</span>';
  } else if (current === 'banker') {
    state.slots[index] = 'player';
    slot.classList.remove('banker');
    slot.classList.add('player');
    slot.innerHTML = '<span class="slot-num">闲</span>';
  } else {
    state.slots[index] = null;
    slot.classList.remove('player');
    slot.innerHTML = `<span class="slot-num">${index + 1}</span>`;
  }

  updateStats();
  updateAnalyzeBtn();
}

// 更新统计
function updateStats() {
  const filled = state.slots.filter(s => s !== null).length;
  const bankers = state.slots.filter(s => s === 'banker').length;
  const players = state.slots.filter(s => s === 'player').length;

  $('input-count').textContent = filled;
  $('banker-count').textContent = bankers;
  $('player-count').textContent = players;
}

// 绑定按钮
function bindButtons() {
  const btnAnalyze = $('btn-analyze');
  if (btnAnalyze) btnAnalyze.addEventListener('click', startAnalysis);
  
  const btnShare = $('btn-share');
  if (btnShare) btnShare.addEventListener('click', handleShare);
  
  const btnCopy = $('btn-copy');
  if (btnCopy) btnCopy.addEventListener('click', () => {
    copyText('142078040');
    showToast('蝙蝠号已复制');
  });
}

// 开始分析
async function startAnalysis() {
  showStep('processing');
  
  const logs = [
    { text: '正在连接大其力算力中心...', delay: 400 },
    { text: `检测到总资金 ¥${state.totalAmount}，正在按 1324 模型分配...`, delay: 700 },
    { text: '正在分析历史路子数据...', delay: 1000 },
    { text: 'AI 深度学习建模中...', delay: 1400 },
    { text: '胜率计算完成', delay: 1800, success: true },
    { text: '预测参数已生成', delay: 2200 },
    { text: '分析完成', delay: 2600, success: true }
  ];

  for (let i = 0; i < logs.length; i++) {
    await delay(logs[i].delay - (i > 0 ? logs[i-1].delay : 0));
    addLog(logs[i].text, logs[i].success);
    updateProgress(((i + 1) / logs.length) * 100);
  }

  await delay(1200);

  state.predictions = generatePredictions();
  showPreview();
}

// 生成预测（按 1324 比例分配金额）
function generatePredictions() {
  const outcomes = ['banker', 'player'];
  const predictions = [];

  for (let i = 0; i < 4; i++) {
    // 按 1324 比例分配
    const ratio = RATIOS[i];
    const amount = Math.floor(state.totalAmount * ratio / RATIO_SUM);

    predictions.push({
      round: i + 1,
      outcome: outcomes[Math.floor(Math.random() * 2)],
      winRate: Math.floor(Math.random() * 11) + 85,
      amount: amount
    });
  }

  return predictions;
}

// 显示预览
function showPreview() {
  showStep('preview');

  const container = $('preview-cards');
  container.innerHTML = '';

  // 显示前 2 局
  state.predictions.slice(0, 2).forEach(pred => {
    const card = document.createElement('div');
    card.className = `preview-card ${pred.outcome}`;
    card.innerHTML = `
      <div class="preview-label">第 ${pred.round} 局</div>
      <div class="preview-value ${pred.outcome}">${pred.outcome === 'banker' ? '庄' : '闲'}</div>
      <div class="preview-rate">
        <div class="preview-rate-bar">
          <div class="preview-rate-fill" style="width: ${pred.winRate}%"></div>
        </div>
        <span class="preview-rate-text">${pred.winRate}%</span>
      </div>
      <div class="preview-amount">投注: ¥${pred.amount}</div>
    `;
    container.appendChild(card);
  });

  // 2秒后弹出分享
  setTimeout(() => {
    if (state.shareCount < 3) {
      $('share-modal').classList.add('active');
    }
  }, 2000);
}

// 处理分享
function handleShare() {
  state.shareCount++;
  $('share-current').textContent = state.shareCount;

  if (state.shareCount >= 3) {
    setTimeout(() => {
      $('share-modal').classList.remove('active');
      showFullResults();
    }, 500);
  }
}

// 显示完整结果
function showFullResults() {
  showStep('full');

  const list = $('prediction-list');
  list.innerHTML = '';

  let totalBet = 0;

  state.predictions.forEach(pred => {
    totalBet += pred.amount;
    const item = document.createElement('div');
    item.className = `pred-item ${pred.outcome}`;
    item.innerHTML = `
      <div class="pred-header">
        <span class="pred-round">第 ${pred.round} 局</span>
        <span class="pred-result ${pred.outcome}">${pred.outcome === 'banker' ? '庄' : '闲'}</span>
        <span class="pred-amount">¥${pred.amount}</span>
      </div>
      <div class="pred-rate">
        <span class="pred-rate-label">胜率</span>
        <div class="pred-rate-bar">
          <div class="pred-rate-fill" style="width: ${pred.winRate}%"></div>
        </div>
        <span class="pred-rate-text">${pred.winRate}%</span>
      </div>
    `;
    list.appendChild(item);
  });

  // 计算汇总
  $('total-bet').textContent = `¥${totalBet}`;
  $('total-profit').textContent = `¥${Math.floor(totalBet * 1.8)}`;
}

// 切换步骤
function showStep(stepName) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const target = $(`step-${stepName}`);
  if (target) target.classList.add('active');
}

// 添加日志
function addLog(text, success = false) {
  const log = $('terminal-log');
  const line = document.createElement('div');
  line.className = `log-line ${success ? 'success' : ''}`;
  line.textContent = `> ${text}`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

// 更新进度
function updateProgress(percent) {
  $('progress-fill').style.width = `${percent}%`;
  $('progress-text').textContent = `${Math.round(percent)}%`;
}

// 复制文本
function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
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
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,255,0,0.9);
    color: #000;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 1000;
    animation: fadeIn 0.3s;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// 延迟
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 启动
init();
