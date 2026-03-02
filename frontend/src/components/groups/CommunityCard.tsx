'use client';

import { useState } from 'react';

interface CommunityAdmin {
  id: string;
  name: string;
  avatar: string;
  role: 'admin';
  joinedAt: string;
}

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: 'member';
  joinedAt: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  admins: CommunityAdmin[];
  members: CommunityMember[];
  createdAt: string;
  isPublic: boolean;
  maxMembers: number;
  category: string;
  rules: string[];
}

interface CommunityCardProps {
  community: Community;
  currentUserRole: 'admin' | 'member' | 'non-member';
  onJoin: (communityId: string) => void;
  onLeave: (communityId: string) => void;
  onView: (communityId: string) => void;
}

export default function CommunityCard({ community, currentUserRole, onJoin, onLeave, onView }: CommunityCardProps) {
  const totalMembers = community.admins.length + community.members.length;
  const availableSlots = community.maxMembers - totalMembers;
  const isFull = availableSlots === 0;
  const canJoin = currentUserRole === 'non-member' && !isFull;
  const adminCount = community.admins.length;
  const needsAdmins = adminCount < 5;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
            {community.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{community.name}</h3>
            <p className="text-sm text-gray-600">
              {totalMembers}/{community.maxMembers} members • {adminCount} admins
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            community.isPublic 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {community.isPublic ? 'Public' : 'Private'}
          </div>
          {needsAdmins && (
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              Needs Admins
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
          {community.category}
        </span>
        {needsAdmins && (
          <span className="text-xs text-orange-600 font-medium">
            {5 - adminCount} more admins needed
          </span>
        )}
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{community.description}</p>

      <div className="flex items-center justify-between mb-3">
        <div className="flex -space-x-2">
          {community.admins.slice(0, 3).map((admin) => (
            <div
              key={admin.id}
              className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
              title={`${admin.name} (Admin)`}
            >
              {admin.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {community.members.slice(0, 2).map((member) => (
            <div
              key={member.id}
              className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {totalMembers > 5 && (
            <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-gray-700 text-xs font-semibold">
              +{totalMembers - 5}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {isFull ? 'Full' : `${availableSlots} slots left`}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(community.id)}
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          View Community
        </button>
        
        {currentUserRole === 'admin' && (
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Manage
          </button>
        )}
        
        {currentUserRole === 'member' && (
          <button
            onClick={() => onLeave(community.id)}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Leave
          </button>
        )}
        
        {canJoin && (
          <button
            onClick={() => onJoin(community.id)}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Join
          </button>
        )}
        
        {isFull && currentUserRole === 'non-member' && (
          <button
            disabled
            className="px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Full
          </button>
        )}
      </div>
    </div>
  );
}

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (community: Omit<Community, 'id' | 'admins' | 'members' | 'createdAt'>) => void;
}

export function CreateCommunityModal({ isOpen, onClose, onCreate }: CreateCommunityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Investment',
    isPublic: true,
    rules: ['Be respectful', 'No financial advice', 'Stay on topic']
  });

  const categories = [
    'Investment',
    'Banking',
    'Technology',
    'Telecommunications',
    'Energy',
    'Manufacturing',
    'Agriculture',
    'Real Estate',
    'General Discussion'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.description.trim()) {
      onCreate({
        name: formData.name,
        description: formData.description,
        avatar: '',
        category: formData.category,
        isPublic: formData.isPublic,
        maxMembers: 200,
        rules: formData.rules
      });
      setFormData({ 
        name: '', 
        description: '', 
        category: 'Investment',
        isPublic: true,
        rules: ['Be respectful', 'No financial advice', 'Stay on topic']
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create New Community</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Kenya Investors Network"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Describe your community's purpose, target audience, and focus..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Community Rules
              </label>
              <div className="space-y-2">
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => {
                        const newRules = [...formData.rules];
                        newRules[index] = e.target.value;
                        setFormData({ ...formData, rules: newRules });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter a rule"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newRules = formData.rules.filter((_, i) => i !== index);
                        setFormData({ ...formData, rules: newRules });
                      }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, rules: [...formData.rules, ''] })}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  Add Rule
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="public"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="public" className="text-sm text-gray-700">
                Public Community (anyone can join)
              </label>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Community Requirements</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Maximum 200 members per community</li>
                <li>• Minimum 5 community administrators required</li>
                <li>• Admins can manage members, settings, and content</li>
                <li>• All members can post and participate</li>
                <li>• Communities must have clear rules and guidelines</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <h3 className="font-medium text-orange-900 mb-2">⚠️ Admin Requirements</h3>
              <p className="text-sm text-orange-800">
                You will need to add 4 more administrators (total of 5) to fully activate your community. 
                Admins share moderation responsibilities and community management.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Community
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
