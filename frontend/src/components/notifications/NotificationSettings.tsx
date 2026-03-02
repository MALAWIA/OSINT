'use client';

import { useNotifications, NotificationPreferences } from '@/contexts/NotificationContext';

export default function NotificationSettings() {
  const { preferences, updatePreferences } = useNotifications();

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Notification Settings</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Alert Types */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Alert Types</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Price Alerts</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when stock prices change significantly
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.priceAlerts}
                onChange={(e) => handlePreferenceChange('priceAlerts', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📰</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">News Alerts</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Receive news about your watched stocks
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.newsAlerts}
                onChange={(e) => handlePreferenceChange('newsAlerts', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Volume Alerts</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about unusual trading volume
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.volumeAlerts}
                onChange={(e) => handlePreferenceChange('volumeAlerts', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </label>
          </div>
        </div>

        {/* Notification Methods */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Notification Methods</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔊</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Sound Alerts</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Play sound for new notifications
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💻</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Desktop Notifications</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Show browser notifications
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.desktopNotifications}
                onChange={(e) => handlePreferenceChange('desktopNotifications', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Email Notifications</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Receive email summaries (Coming soon)
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                disabled
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Notification Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                <li>Price alerts trigger when stocks move beyond your threshold</li>
                <li>News alerts are checked every 5 minutes</li>
                <li>Desktop notifications require browser permission</li>
                <li>All data is saved locally in your browser</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
