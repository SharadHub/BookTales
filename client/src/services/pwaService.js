// PWA Service for offline functionality and background sync
class PWAService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Store actions for background sync
  storeOfflineAction(action) {
    const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]');
    offlineActions.push({
      ...action,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });
    localStorage.setItem('offlineActions', JSON.stringify(offlineActions));
  }

  // Sync offline actions when back online
  async syncOfflineActions() {
    const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]');
    
    for (const action of offlineActions) {
      try {
        await this.executeAction(action);
        this.removeOfflineAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  }

  async executeAction(action) {
    const { type, data, endpoint } = action;
    
    switch (type) {
      case 'POST':
        return fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        });
      
      case 'PUT':
        return fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        });
      
      case 'DELETE':
        return fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  removeOfflineAction(actionId) {
    const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]');
    const filtered = offlineActions.filter(action => action.id !== actionId);
    localStorage.setItem('offlineActions', JSON.stringify(filtered));
  }

  // Cache API responses for offline use
  async cacheResponse(key, data) {
    if ('caches' in window) {
      const cache = await caches.open('booktales-api-v1');
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      // Convert cache key to a proper URL format
      const url = key.startsWith('http') ? key : `/api/${key}`;
      await cache.put(url, response);
    }
  }

  // Get cached response
  async getCachedResponse(key) {
    if ('caches' in window) {
      const cache = await caches.open('booktales-api-v1');
      // Convert cache key to the same URL format used in cacheResponse
      const url = key.startsWith('http') ? key : `/api/${key}`;
      const response = await cache.match(url);
      if (response) {
        return response.json();
      }
    }
    return null;
  }

  // Clear all caches
  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  // Show offline notification
  showOfflineNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('BookTales', {
          body: message,
          icon: '/placeholder-book.jpg',
          badge: '/placeholder-book.jpg',
          tag: 'offline-notification'
        });
      });
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Get network status
  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
      effectiveType: navigator.connection?.effectiveType || 'unknown'
    };
  }
}

export default new PWAService();
