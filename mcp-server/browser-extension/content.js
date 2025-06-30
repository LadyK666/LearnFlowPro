// 监听LocalStorage变化
function observeLocalStorage() {
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;

  localStorage.setItem = function(key, value) {
    if (key === 'token') {
      console.log('检测到Token更新:', value);
      syncTokenToServer(value);
    }
    originalSetItem.apply(this, arguments);
  };

  localStorage.removeItem = function(key) {
    if (key === 'token') {
      console.log('Token被删除');
      syncTokenToServer(null);
    }
    originalRemoveItem.apply(this, arguments);
  };
}

// 同步Token到MCP服务器
async function syncTokenToServer(token) {
  try {
    const response = await fetch('http://localhost:3001/sync-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      console.log('Token同步成功');
    } else {
      console.log('Token同步失败');
    }
  } catch (error) {
    console.log('Token同步错误:', error);
  }
}

// 初始化时检查现有Token
function checkExistingToken() {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('发现现有Token，正在同步...');
    syncTokenToServer(token);
  }
}

// 启动监听
observeLocalStorage();
checkExistingToken();

console.log('My-Day Token Sync 已启动'); 