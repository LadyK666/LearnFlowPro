// ����LocalStorage�仯
function observeLocalStorage() {
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;

  localStorage.setItem = function(key, value) {
    if (key === 'token') {
      console.log('��⵽Token����:', value);
      syncTokenToServer(value);
    }
    originalSetItem.apply(this, arguments);
  };

  localStorage.removeItem = function(key) {
    if (key === 'token') {
      console.log('Token��ɾ��');
      syncTokenToServer(null);
    }
    originalRemoveItem.apply(this, arguments);
  };
}

// ͬ��Token��MCP������
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
      console.log('Tokenͬ���ɹ�');
    } else {
      console.log('Tokenͬ��ʧ��');
    }
  } catch (error) {
    console.log('Tokenͬ������:', error);
  }
}

// ��ʼ��ʱ�������Token
function checkExistingToken() {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('��������Token������ͬ��...');
    syncTokenToServer(token);
  }
}

// ��������
observeLocalStorage();
checkExistingToken();

console.log('My-Day Token Sync ������'); 