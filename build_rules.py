import json

# ... (保留原本的網域清單) ...
ad_domains = [
    "doubleclick.net", "googleadservices.com", "googlesyndication.com", 
    "adservice.google.com", "google-analytics.com", "2mdn.net",
    "connect.facebook.net", "facebook.net", "fbevents.js",
    "adnxs.com", "criteo.com", "pubmatic.com", "taboola.com", "outbrain.com",
    "rubiconproject.com", "openx.net", "adsrvr.org", "moatads.com",
    "smartadserver.com", "teads.tv", "bidswitch.net", "casalemedia.com",
    "amazon-adsystem.com", "advertising.com", "gemini.yahoo.com",
    "popads.net", "popcash.net", "propellerads.com", "adsterra.com",
    "exoclick.com", "juicyads.com", "ero-advertising.com"
]

security_domains = [
    # Trackers
    "hotjar.com", "clarity.ms", "crazyegg.com", "luckyorange.com",
    "mc.yandex.ru", "statcounter.com", "scorecardresearch.com",
    "chartbeat.com", "quantserve.com", "newrelic.com",
    # Miners
    "coin-hive.com", "coinhive.com", "jsecoin.com", "crypto-loot.com",
    "minr.pw", "xmr.pool.minergate.com", "monerominer.rocks",
    "webminepool.com",
    # Fingerprinters
    "bluecava.com", "iovation.com", "threatmetrix.com", "maxmind.com",
    "siftscience.com", "fingerprintjs.com",
    # Test
    "malicious-test-domain.com"
]

def create_block_rules(domains, start_id):
    rules = []
    for index, domain in enumerate(domains):
        rule = {
            "id": start_id + index,
            "priority": 1,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": domain,
                "resourceTypes": ["script", "image", "xmlhttprequest", "sub_frame", "ping", "media", "websocket"]
            }
        }
        rules.append(rule)
    return rules

# 生成廣告規則
ad_rules = create_block_rules(ad_domains, 1)

# 生成安全規則 (網域阻擋)
sec_rules = create_block_rules(security_domains, 1000)

# ==========================================
# 新增：進階安全規則 (HTTP斷線 & Referrer移除)
# ==========================================

# 規則 9001: 阻擋所有 HTTP 請求 (不安全就斷線)
http_block_rule = {
    "id": 9001,
    "priority": 1,
    "action": { "type": "block" },
    "condition": {
        "urlFilter": "http://*",  # 匹配所有 http 開頭
        "resourceTypes": ["main_frame"] # 只針對主頁面導航，避免過度誤殺子資源
    }
}

# 規則 9002: 移除 Referer Header (隱形模式)
referrer_strip_rule = {
    "id": 9002,
    "priority": 1,
    "action": {
        "type": "modifyHeaders",
        "requestHeaders": [
            { "header": "Referer", "operation": "remove" }
        ]
    },
    "condition": {
        "urlFilter": "|http*",
        "resourceTypes": ["main_frame", "sub_frame", "xmlhttprequest", "script", "image"]
    }
}

# 規則 9003: 阻擋所有第三方 iframe (零信任基底)
# 優先權設為 1，白名單規則將會設為 2 或更高以覆蓋此規則
iframe_block_rule = {
    "id": 9003,
    "priority": 1,
    "action": { "type": "block" },
    "condition": {
        "resourceTypes": ["sub_frame"],
        "domainType": "thirdParty"
    }
}

sec_rules.append(http_block_rule)
sec_rules.append(referrer_strip_rule)
sec_rules.append(iframe_block_rule)

# ==========================================
# 預設白名單 (內建放行) - Priority 2
# ==========================================
default_whitelist = ["youtube.com", "google.com", "facebook.com"]
for i, domain in enumerate(default_whitelist):
    rule = {
        "id": 9100 + i,
        "priority": 2, # 高於阻擋規則
        "action": { "type": "allow" },
        "condition": {
            "urlFilter": f"||{domain}",
            "resourceTypes": ["sub_frame", "script", "xmlhttprequest"]
        }
    }
    sec_rules.append(rule)


# 寫入檔案
with open("WebSentinel/rules/ads.json", "w") as f:
    json.dump(ad_rules, f, indent=2)
    print(f"Generated {len(ad_rules)} ad blocking rules.")

with open("WebSentinel/rules/security.json", "w") as f:
    json.dump(sec_rules, f, indent=2)
    print(f"Generated {len(sec_rules)} security rules (including HTTP-Block & Anti-Referrer).")
