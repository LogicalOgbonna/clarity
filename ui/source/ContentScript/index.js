var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { browser } from 'webextension-polyfill-ts';
import Scrapper from '../common/scrapper';
var API_URL = 'http://localhost:3000/api';
var getUserId = function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, browser.storage.sync.get('clarityUserId')];
            case 1:
                result = _a.sent();
                return [2, result.clarityUserId || null];
            case 2:
                error_1 = _a.sent();
                console.error('Error getting user ID:', error_1);
                return [2, null];
            case 3: return [2];
        }
    });
}); };
var isCacheValid = function (cachedData) {
    try {
        var data = JSON.parse(cachedData);
        var cacheTime = data.cachedAt;
        var now = Date.now();
        var maxAge = 7 * 24 * 60 * 60 * 1000;
        return now - cacheTime < maxAge;
    }
    catch (_a) {
        return false;
    }
};
var initializeChatHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
    var userId, cacheKey, cachedData, response, data, dataWithTimestamp, emptyData, error_2, emptyData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, getUserId()];
            case 1:
                userId = _a.sent();
                if (!userId) {
                    console.log('No user ID found, skipping chat history initialization');
                    return [2];
                }
                cacheKey = "user_chats_".concat(userId);
                cachedData = localStorage.getItem(cacheKey);
                if (cachedData && isCacheValid(cachedData)) {
                    console.log('Using cached chat history from localStorage');
                    return [2];
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, , 8]);
                console.log('No valid cache found, fetching chat history from API...');
                return [4, fetch("".concat(API_URL, "/chat/history/").concat(userId, "?page=1&limit=50"))];
            case 3:
                response = _a.sent();
                if (!response.ok) return [3, 5];
                return [4, response.json()];
            case 4:
                data = _a.sent();
                dataWithTimestamp = {
                    chats: data.chats || [],
                    pagination: data.pagination || null,
                    status: data.status || 'success',
                    cachedAt: Date.now(),
                };
                localStorage.setItem(cacheKey, JSON.stringify(dataWithTimestamp));
                console.log('Chat history fetched and cached in localStorage');
                return [3, 6];
            case 5:
                console.error('Failed to fetch chat history:', response.status);
                emptyData = {
                    chats: [],
                    pagination: null,
                    status: 'error',
                    cachedAt: Date.now(),
                };
                localStorage.setItem(cacheKey, JSON.stringify(emptyData));
                _a.label = 6;
            case 6: return [3, 8];
            case 7:
                error_2 = _a.sent();
                console.error('Error fetching chat history:', error_2);
                emptyData = {
                    chats: [],
                    pagination: null,
                    status: 'error',
                    cachedAt: Date.now(),
                };
                localStorage.setItem(cacheKey, JSON.stringify(emptyData));
                return [3, 8];
            case 8: return [2];
        }
    });
}); };
var addNewChatToHistory = function (newChat) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, cacheKey, cachedData, data, newData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, getUserId()];
            case 1:
                userId = _a.sent();
                if (!userId)
                    return [2];
                cacheKey = "user_chats_".concat(userId);
                cachedData = localStorage.getItem(cacheKey);
                if (cachedData) {
                    try {
                        data = JSON.parse(cachedData);
                        data.chats.unshift(newChat);
                        if (data.chats.length > 50) {
                            data.chats = data.chats.slice(0, 50);
                        }
                        data.cachedAt = Date.now();
                        localStorage.setItem(cacheKey, JSON.stringify(data));
                        console.log('New chat added to history cache');
                    }
                    catch (error) {
                        console.error('Error updating chat history cache:', error);
                    }
                }
                else {
                    newData = {
                        chats: [newChat],
                        pagination: null,
                        status: 'success',
                        cachedAt: Date.now(),
                    };
                    localStorage.setItem(cacheKey, JSON.stringify(newData));
                    console.log('Initialized chat history cache with new chat');
                }
                return [2];
        }
    });
}); };
var observer = null;
var isProcessing = false;
var debounceTimer = null;
var currentDomain = '';
var getOrFetchPolicy = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var _c, hrefHostname, domain, hrefStorageKey, errorKey, hostname, patchStorageKey, patchPolicy, cachedPolicy, cachedError, response, result, error_3;
    var element = _b.element, type = _b.type;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _c = new URL(element.href), hrefHostname = _c.hostname, domain = _c.origin;
                hrefStorageKey = "".concat(hrefHostname, "_").concat(type);
                errorKey = "".concat(hrefStorageKey, "_error");
                hostname = new URL(window.location.href).hostname;
                patchStorageKey = "".concat(hostname, "_").concat(type);
                patchPolicy = localStorage.getItem(patchStorageKey);
                if (patchPolicy) {
                    return [2, JSON.parse(patchPolicy)];
                }
                cachedPolicy = localStorage.getItem(hrefStorageKey);
                if (cachedPolicy) {
                    return [2, JSON.parse(cachedPolicy)];
                }
                cachedError = localStorage.getItem(errorKey);
                if (cachedError) {
                    return [2, null];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 4, , 5]);
                return [4, fetch("".concat(API_URL, "/policy/fetch-or-create"), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ domain: domain, link: element.href, type: type }),
                    })];
            case 2:
                response = _d.sent();
                if (!response.ok) {
                    throw new Error("Server error: ".concat(response.status));
                }
                return [4, response.json()];
            case 3:
                result = _d.sent();
                if (result.policy) {
                    localStorage.setItem(hrefStorageKey, JSON.stringify(result.policy));
                    if (Scrapper.DEFAULT_KEYWORDS[type].some(function (keyword) {
                        return element.innerText.toLowerCase().includes(keyword.toLowerCase());
                    })) {
                        localStorage.setItem(patchStorageKey, JSON.stringify(result.policy));
                    }
                }
                return [2, result.policy];
            case 4:
                error_3 = _d.sent();
                localStorage.setItem(errorKey, 'error');
                console.error("Error fetching/creating ".concat(type, " policy:"), error_3);
                return [2, null];
            case 5: return [2];
        }
    });
}); };
var processElements = function () { return __awaiter(void 0, void 0, void 0, function () {
    var elements, policyPromises_1, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (isProcessing)
                    return [2];
                isProcessing = true;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, 6, 7]);
                return [4, Scrapper.findElement()];
            case 2:
                elements = _a.sent();
                if (!(elements.terms.length > 0 || elements.privacy.length > 0)) return [3, 4];
                Scrapper.addIndicatorsToElements(elements);
                policyPromises_1 = [];
                elements.privacy.forEach(function (element) {
                    if (element.href) {
                        policyPromises_1.push(getOrFetchPolicy({ element: element, type: 'privacy' }));
                    }
                });
                elements.terms.forEach(function (element) {
                    if (element.href) {
                        policyPromises_1.push(getOrFetchPolicy({ element: element, type: 'terms' }));
                    }
                });
                return [4, Promise.allSettled(policyPromises_1)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [3, 7];
            case 5:
                error_4 = _a.sent();
                console.error('Error in content script:', error_4);
                return [3, 7];
            case 6:
                isProcessing = false;
                return [7];
            case 7: return [2];
        }
    });
}); };
var debouncedProcessElements = function () {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(function () {
        processElements();
    }, 1000);
};
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var hostname;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hostname = Scrapper.getCurrentUrl().hostname;
                currentDomain = hostname;
                return [4, initializeChatHistory()];
            case 1:
                _a.sent();
                return [4, processElements()];
            case 2:
                _a.sent();
                return [4, Scrapper.retryWithDelay(processElements, 10, 2000)];
            case 3:
                _a.sent();
                observer = Scrapper.startSPAObserver(debouncedProcessElements);
                return [2];
        }
    });
}); };
var handleNavigation = function () {
    var hostname = Scrapper.getCurrentUrl().hostname;
    if (hostname !== currentDomain) {
        currentDomain = hostname;
        if (observer) {
            observer.disconnect();
        }
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        setTimeout(main, 1000);
    }
};
var currentUrl = window.location.href;
var checkForNavigation = function () {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        handleNavigation();
    }
};
setInterval(checkForNavigation, 2000);
window.addEventListener('message', function (event) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (event.source !== window)
                    return [2];
                if (!(event.data.type === 'ADD_CHAT_TO_HISTORY')) return [3, 2];
                return [4, addNewChatToHistory(event.data.chat)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2];
        }
    });
}); });
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
}
else {
    main();
}
window.addEventListener('beforeunload', function () {
    if (observer) {
        observer.disconnect();
    }
});
export { addNewChatToHistory, initializeChatHistory };
