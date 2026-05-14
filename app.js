/**
 * AI 路子分析系统 - 主应用逻辑 v4.0
 * 多算法融合引擎 + 动态可扩展输入 + 配置化
 */

// 应用状态
const state = {
  history: [],           // 用户输入的历史路子
  shareCount: 0,
  predictions: [],       // 引擎预测结果
  totalAmount: 0,
  maxSlots: CONFIG.analysis.maxHistory,
  currentStep: 'input'
};

// DOM 缓存
const $ = id => document.getElementById(id);

// ========== 初始化 ==========
function init() {
  updateSystemInfo();
  updateContactInfo();
  createSlotGrid();
  bindButtons();
  bindAmountInput();
  updateAnalyzeBtn();
}

// 更新底部联系信息
function updateContactInfo() {
  $('footer-label').textContent = CONFIG.contact.label;
  $('bat-id').textContent = CONFIG.contact.id;
}

// 更新系统信息（从 CONFIG 读取）
function updateSystemInfo() {
  const version = $('app-version');
  const title = document.title;
  if (version) version.textContent = CONFIG.system.version;
  document.title = CONFIG.system.name;
}

// ========== 动态生成输入格子 ==========
function createSlotGrid() {
  const container = $('input-slots');
  if (!container) return;
  
  // 清空旧内容
  container.innerHTML = '';
  
  // 每行 5 个，自动换行
  const cols = 5;
  const rows = Math.ceil(state.maxSlots / cols);
  
  for (let r = 0; r < rows; r++) {
    const row = document.createElement('div');
    row.className = 'slot-row';
    
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= state.maxSlots) break;
      
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.index = idx;
      slot.innerHTML = `<span class="slot-num">${idx + 1}</span>`;
      slot.addEventListener('click', () => toggleSlot(idx));
      row.appendChild(slot);
    }
    container.appendChild(row);
  }
}

// ========== 切换格子 ==========
function toggleSlot(index) {
  const slot = document.querySelector(`.slot[data-index="${index}"]`);
  const current = state.history[index];
  
  if (current === null || current === undefined) {
    state.history[index] = 'banker';
    slot.className = 'slot banker';
    slot.innerHTML = '<span class="slot-num">庄</span>';
  } else if (current === 'banker') {
    state.history[index] = 'player';
    slot.className = 'slot player';
    slot.innerHTML = '<span class="slot-num">闲</span>';
  } else if (current === 'player') {
    state.history[index] = 'tie';
    slot.className = 'slot tie';
    slot.innerHTML = '<span class="slot-num">和</span>';
  } else {
    state.history[index] = null;
    slot.className = 'slot';
    slot.innerHTML = `<span class="slot-num">${index + 1}</span>`;
  }
  
  updateStats();
  updateAnalyzeBtn();
}

// ========== 更新统计 ==========
function updateStats() {
  const filled = state.history.filter(s => s !== null && s !== undefined).length;
  const bankers = state.history.filter(s => s === 'banker').length;
  const players = state.history.filter(s => s === 'player').length;
  const ties = state.history.filter(s => s === 'tie').length;
  
  $('input-count').textContent = filled;
  $('banker-count').textContent = bankers;
  $('player-count').textContent = players;
  $('tie-count').textContent = ties;
}

// ========== 金额输入 ==========
function bindAmountInput() {
  const input = $('total-amount');
  if (!input) return;
  
  input.addEventListener('input', () => {
    const val = parseInt(input.value) || 0;
    state.totalAmount = val;
    updateAnalyzeBtn();
  });
  
  document.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = parseInt(btn.dataset.amount);
      input.value = amount;
      state.totalAmount = amount;
      updateAnalyzeBtn();
    });
  });
}

// ========== 分析按钮状态 ==========
function updateAnalyzeBtn() {
  const filled = state.history.filter(s => s !== null && s !== undefined).length;
  const hasAmount = state.totalAmount >= CONFIG.analysis.minHistory * 10;
  const btn = $('btn-analyze');
  if (btn) btn.disabled = !(filled >= CONFIG.analysis.minHistory && hasAmount);
}

// ========== 按钮绑定 ==========
function bindButtons() {
  $('btn-analyze')?.addEventListener('click', startAnalysis);
  $('btn-share')?.addEventListener('click', handleShare);
  $('btn-copy')?.addEventListener('click', () => {
    copyText(CONFIG.contact.id);
    showToast(`${CONFIG.contact.label}已复制`);
  });
}

// ========== 开始分析 ==========
async function startAnalysis() {
  // 提取有效历史（过滤 null/undefined）
  const validHistory = state.history.filter(s => s !== null && s !== undefined);
  if (validHistory.length < CONFIG.analysis.minHistory) return;
  
  showStep('processing');
  
  // 获取趋势分析
  const trend = analyzeTrend(validHistory);
  
  // 分析日志
  const logs = [
    { text: `系统初始化，已接入${CONFIG.analysis.maxSlots}局数据采集...`, delay: 300 },
    { text: `检测到有效数据${validHistory.length}局（庄${trend.banker} 闲${trend.player} 和${trend.tie}）`, delay: 700 },
    { text: `资金规划：总投入¥${state.totalAmount}，按1324模型分配`, delay: 1000 },
    { text: `庄占比${trend.bankerRate}%，闲占比${trend.playerRate}%，失衡度${trend.bankerRate - trend.playerRate}%`, delay: 1400 },
    { text: `最长连庄${trend.maxBanker}局，最长连闲${trend.maxPlayer}局`, delay: 1800 },
    { text: `启动趋势跟随算法...`, delay: 2200 },
    { text: `启动马氏链转移矩阵分析...`, delay: 2600 },
    { text: `启动频率回归模型...`, delay: 3000 },
    { text: `启动周期检测引擎...`, delay: 3400 },
    { text: `启动长龙趋势分析...`, delay: 3800 },
    { text: `5大算法融合计算中...`, delay: 4200 },
    { text: '多算法投票完成，生成预测参数', delay: 4600, success: true },
    { text: '分析完成', delay: 5000, success: true }
  ];
  
  for (let i = 0; i < logs.length; i++) {
    await delay(logs[i].delay - (i > 0 ? logs[i-1].delay : 0));
    addLog(logs[i].text, logs[i].success);
    updateProgress(((i + 1) / logs.length) * 100);
  }
  
  await delay(800);
  
  // 生成预测（调用引擎）
  generatePredictions(validHistory);
  showPreview();
}

// ========== 生成预测 ==========
function generatePredictions(history) {
  const predictions = [];
  
  // 第 1 局：基于当前历史
  const pred1 = analyzePredictions(history);
  predictions.push({ round: 1, ...pred1 });
  
  // 第 2-4 局：模拟后续预测（每次追加前一次预测结果到历史）
  let simHistory = [...history];
  for (let i = 1; i < CONFIG.analysis.predictionCount; i++) {
    simHistory.push(predictions[i-1].outcome);
    const pred = analyzePredictions(simHistory);
    predictions.push({ round: i + 1, ...pred });
  }
  
  state.predictions = predictions;
}

// ========== 预览 ==========
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
      <div class="preview-value ${pred.outcome}">${pred.outcome === 'banker' ? '庄' : pred.outcome === 'player' ? '闲' : '和'}</div>
      <div class="preview-rate">
        <div class="preview-rate-bar">
          <div class="preview-rate-fill" style="width: ${pred.confidence}%"></div>
        </div>
        <span class="preview-rate-text">${pred.confidence}%</span>
      </div>
      <div class="preview-algos">${pred.algoCount || 0}/5 算法共识</div>
      <div class="preview-reasons">${pred.reasons?.slice(0, 2).join('<br>') || ''}</div>
    `;
    container.appendChild(card);
  });
  
  // 弹出分享
  setTimeout(() => {
    if (state.shareCount < CONFIG.share.required) {
      $('share-modal').classList.add('active');
    }
  }, 2000);
}

// ========== 分享处理 ==========
function handleShare() {
  state.shareCount++;
  $('share-current').textContent = state.shareCount;
  
  if (state.shareCount >= CONFIG.share.required) {
    setTimeout(() => {
      $('share-modal').classList.remove('active');
      showFullResults();
    }, 500);
  }
}

// ========== 完整结果 ==========
function showFullResults() {
  showStep('full');
  
  const list = $('prediction-list');
  list.innerHTML = '';
  
  let totalBet = 0;
  const ratios = CONFIG.ratios;
  const ratioSum = ratios.reduce((a, b) => a + b, 0);
  
  state.predictions.forEach(pred => {
    const amount = Math.floor(state.totalAmount * ratios[pred.round - 1] / ratioSum);
    totalBet += amount;
    
    const item = document.createElement('div');
    item.className = `pred-item ${pred.outcome}`;
    item.innerHTML = `
      <div class="pred-header">
        <span class="pred-round">第 ${pred.round} 局</span>
        <span class="pred-result ${pred.outcome}">${pred.outcome === 'banker' ? '庄' : pred.outcome === 'player' ? '闲' : '和'}</span>
        <span class="pred-amount">¥${amount} (${ratios[pred.round - 1]}单位)</span>
      </div>
      <div class="pred-rate">
        <span class="pred-rate-label">信心指数</span>
        <div class="pred-rate-bar">
          <div class="pred-rate-fill" style="width: ${pred.confidence}%"></div>
        </div>
        <span class="pred-rate-text">${pred.confidence}%</span>
      </div>
      <div class="pred-reasons">${pred.reasons?.map(r => `• ${r}`).join('<br>') || ''}</div>
    `;
    list.appendChild(item);
  });
  
  $('total-bet').textContent = `¥${totalBet}`;
  $('total-profit').textContent = `¥${Math.floor(totalBet * 1.8)}`;
  $('success-toast').textContent = `✅ 参数已解锁，请添加${CONFIG.contact.label}获取实时监控`;
}

// ========== 步骤切换 ==========
function showStep(stepName) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const target = $(`step-${stepName}`);
  if (target) target.classList.add('active');
}

// ========== 工具函数 ==========
function addLog(text, success = false) {
  const log = $('terminal-log');
  const line = document.createElement('div');
  line.className = `log-line ${success ? 'success' : ''}`;
  line.textContent = `> ${text}`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

function updateProgress(percent) {
  $('progress-fill').style.width = `${percent}%`;
  $('progress-text').textContent = `${Math.round(percent)}%`;
}

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    background: rgba(0,255,0,0.9); color: #000; padding: 12px 24px;
    border-radius: 8px; font-size: 14px; font-weight: 600; z-index: 1000;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 启动
init();
