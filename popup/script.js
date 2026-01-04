document.addEventListener('DOMContentLoaded', async () => {
  const toggleAds = document.getElementById('toggle-ads');
  const toggleSecurity = document.getElementById('toggle-security');
  const statusMsg = document.getElementById('status-msg');
  const whitelistInput = document.getElementById('whitelist-input');
  const addBtn = document.getElementById('add-btn');
  const whitelistList = document.getElementById('whitelist-list');

  const RULESET_ADS = 'ruleset_ads';
  const RULESET_SECURITY = 'ruleset_security';

  // 1. 初始化開關
  try {
    const enabledRulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
    toggleAds.checked = enabledRulesets.includes(RULESET_ADS);
    toggleSecurity.checked = enabledRulesets.includes(RULESET_SECURITY);
    
    // 初始化白名單列表
    renderWhitelist();
  } catch (error) {
    console.error("Initialization error:", error);
  }

  // 2. 開關事件
  toggleAds.addEventListener('change', () => updateRuleset(RULESET_ADS, toggleAds.checked));
  toggleSecurity.addEventListener('change', () => updateRuleset(RULESET_SECURITY, toggleSecurity.checked));

  // 3. 白名單事件
  addBtn.addEventListener('click', addDomainToWhitelist);
  whitelistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addDomainToWhitelist();
  });

  async function updateRuleset(rulesetId, isEnable) {
    try {
      const updateConfig = isEnable 
        ? { enableRulesetIds: [rulesetId] } 
        : { disableRulesetIds: [rulesetId] };
      await chrome.declarativeNetRequest.updateEnabledRulesets(updateConfig);
      showStatus("設定已更新");
    } catch (error) {
      showStatus("更新失敗");
    }
  }

  async function addDomainToWhitelist() {
    const domain = whitelistInput.value.trim();
    if (!domain) return;

    // 簡單的網域格式驗證
    if (!domain.includes('.') || domain.includes(' ')) {
      showStatus("請輸入有效的網域");
      return;
    }

    try {
      // 取得現有規則以計算 ID
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const newId = existingRules.length > 0 
        ? Math.max(...existingRules.map(r => r.id)) + 1 
        : 2000; // 動態規則 ID 從 2000 開始

      // 建立放行規則 (Priority 2 > 阻擋規則的 Priority 1)
      const newRule = {
        "id": newId,
        "priority": 2,
        "action": { "type": "allow" },
        "condition": {
          "urlFilter": `||${domain}`, // 使用 Adblock 風格的語法，匹配 domain 及其子網域
          "resourceTypes": ["sub_frame", "script", "xmlhttprequest"]
        }
      };

      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [newRule],
        removeRuleIds: []
      });

      whitelistInput.value = '';
      renderWhitelist();
      showStatus(`已允許 ${domain}`);
    } catch (error) {
      console.error(error);
      showStatus("新增規則失敗");
    }
  }

  async function removeDomainFromWhitelist(ruleId) {
    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [],
        removeRuleIds: [ruleId]
      });
      renderWhitelist();
      showStatus("已移除規則");
    } catch (error) {
      showStatus("移除失敗");
    }
  }

  async function renderWhitelist() {
    whitelistList.innerHTML = '';
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    
    // 預設的三大巨頭 (雖不在動態規則裡，但介面上顯示一下讓使用者安心)
    const defaults = ['youtube.com', 'google.com', 'facebook.com'];
    defaults.forEach(d => {
      // 這裡僅作展示，無法刪除預設值
      const li = document.createElement('li');
      li.className = 'whitelist-item';
      li.innerHTML = `<span>${d} <span style="color:#bdc3c7;font-size:10px">(內建)</span></span>`;
      whitelistList.appendChild(li);
    });

    // 渲染使用者自訂規則
    rules.forEach(rule => {
      // 解析出原本輸入的網域 (從 ||domain 格式還原)
      let domainDisplay = rule.condition.urlFilter.replace('||', '');
      
      const li = document.createElement('li');
      li.className = 'whitelist-item';
      li.innerHTML = `
        <span>${domainDisplay}</span>
        <span class="delete-btn" data-id="${rule.id}">×</span>
      `;
      
      li.querySelector('.delete-btn').addEventListener('click', () => {
        removeDomainFromWhitelist(rule.id);
      });
      
      whitelistList.appendChild(li);
    });
  }

  function showStatus(msg) {
    statusMsg.innerText = msg;
    setTimeout(() => { statusMsg.innerText = "系統運作中"; }, 2000);
  }
});
