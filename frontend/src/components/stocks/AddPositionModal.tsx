'use client';

import { useState } from 'react';
import { useStockTracking } from '@/contexts/StockTrackingContext';

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockSymbol: string;
  companyName: string;
  currentPrice: number;
}

export default function AddPositionModal({ isOpen, onClose, stockSymbol, companyName, currentPrice }: AddPositionModalProps) {
  const { addPosition } = useStockTracking();
  const [formData, setFormData] = useState({
    shares: '',
    purchasePrice: currentPrice.toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const shares = parseFloat(formData.shares);
    const purchasePrice = parseFloat(formData.purchasePrice);
    
    if (shares > 0 && purchasePrice > 0) {
      addPosition({
        symbol: stockSymbol,
        companyName,
        shares,
        purchasePrice,
        purchaseDate: new Date().toISOString(),
      });
      
      setFormData({ shares: '', purchasePrice: currentPrice.toString() });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add {stockSymbol} to Portfolio
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">{companyName}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">{stockSymbol}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  KES {currentPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Shares
              </label>
              <input
                type="number"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                placeholder="Enter number of shares"
                min="1"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase Price per Share (KES)
              </label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="Enter purchase price"
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Investment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shares:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.shares || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price per Share:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    KES {parseFloat(formData.purchasePrice || '0').toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">Total Investment:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    KES {((parseFloat(formData.shares || '0') * parseFloat(formData.purchasePrice || '0'))).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.shares || !formData.purchasePrice || parseFloat(formData.shares) <= 0 || parseFloat(formData.purchasePrice) <= 0}
              >
                Add to Portfolio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
