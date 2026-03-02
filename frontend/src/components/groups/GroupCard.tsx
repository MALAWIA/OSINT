'use client';

import { useState } from 'react';

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  admin: string;
  members: Member[];
  createdAt: string;
  isPrivate: boolean;
  maxMembers: number;
  inviteLink?: string;
  accessMethod?: 'link' | 'request' | 'both';
  joinRequests?: JoinRequest[];
}

interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface GroupCardProps {
  group: Group;
  currentUserRole: 'admin' | 'member' | 'non-member';
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
  onView: (groupId: string) => void;
  onRequestJoin: (groupId: string, message: string) => void;
  onJoinWithLink: (groupId: string, inviteLink: string) => void;
  onCopyInviteLink: (inviteLink: string) => void;
}

export default function GroupCard({ 
  group, 
  currentUserRole, 
  onJoin, 
  onLeave, 
  onView, 
  onRequestJoin, 
  onJoinWithLink, 
  onCopyInviteLink 
}: GroupCardProps) {
  const availableSlots = group.maxMembers - group.members.length;
  const isFull = availableSlots === 0;
  const canJoin = currentUserRole === 'non-member' && !isFull;
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleRequestJoin = () => {
    if (requestMessage.trim()) {
      onRequestJoin(group.id, requestMessage);
      setRequestMessage('');
      setShowRequestModal(false);
    }
  };

  const handleJoinWithLink = () => {
    if (inviteCode.trim()) {
      onJoinWithLink(group.id, inviteCode);
      setInviteCode('');
      setShowLinkInput(false);
    }
  };

  const handleCopyLink = () => {
    if (group.inviteLink) {
      onCopyInviteLink(group.inviteLink);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{group.name}</h3>
            <p className="text-sm text-gray-600">
              {group.members.length}/{group.maxMembers} members
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          group.isPrivate 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {group.isPrivate ? 'Private' : 'Public'}
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{group.description}</p>

      <div className="flex items-center justify-between mb-3">
        <div className="flex -space-x-2">
          {group.members.slice(0, 4).map((member) => (
            <div
              key={member.id}
              className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {group.members.length > 4 && (
            <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-gray-700 text-xs font-semibold">
              +{group.members.length - 4}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {isFull ? 'Full' : `${availableSlots} slots left`}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(group.id)}
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          View Group
        </button>
        
        {currentUserRole === 'admin' && (
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Manage
          </button>
        )}
        
        {currentUserRole === 'member' && (
          <button
            onClick={() => onLeave(group.id)}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Leave
          </button>
        )}
        
        {canJoin && (
          <div className="flex gap-2">
            {group.isPrivate ? (
              <>
                {/* Private Group Access Options */}
                {(!group.accessMethod || group.accessMethod === 'request' || group.accessMethod === 'both') && (
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Request to Join
                  </button>
                )}
                {(!group.accessMethod || group.accessMethod === 'link' || group.accessMethod === 'both') && (
                  <button
                    onClick={() => setShowLinkInput(true)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Join with Code
                  </button>
                )}
              </>
            ) : (
              /* Public Group */
              <button
                onClick={() => onJoin(group.id)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Join
              </button>
            )}
          </div>
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

      {/* Request to Join Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request to Join {group.name}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send a message to the group admin explaining why you'd like to join this private group.
            </p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Introduce yourself and explain your interest in this group..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">{requestMessage.length}/200</span>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestJoin}
                disabled={!requestMessage.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join with Link Modal */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Join {group.name} with Invite Code</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the invite code provided by the group admin to join this private group.
            </p>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code (e.g., ABC123)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={10}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowLinkInput(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinWithLink}
                disabled={!inviteCode.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Join Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (group: Omit<Group, 'id' | 'members' | 'createdAt'>) => void;
}

export function CreateGroupModal({ isOpen, onClose, onCreate }: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    accessMethod: 'both' as 'link' | 'request' | 'both'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.description.trim()) {
      // Generate invite link for private groups
      const inviteLink = formData.isPrivate ? `INVITE-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined;
      
      onCreate({
        name: formData.name,
        description: formData.description,
        avatar: '',
        admin: 'You',
        maxMembers: 20,
        isPrivate: formData.isPrivate,
        accessMethod: formData.isPrivate ? formData.accessMethod : undefined,
        inviteLink,
        joinRequests: []
      });
      setFormData({ name: '', description: '', isPrivate: false, accessMethod: 'both' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create New Group</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., NSE Tech Investors"
                required
              />
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
                placeholder="Describe your group's purpose and focus..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="private"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="private" className="text-sm text-gray-700">
                Private Group (requires approval to join)
              </label>
            </div>

            {formData.isPrivate && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Method
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="accessMethod"
                        value="link"
                        checked={formData.accessMethod === 'link'}
                        onChange={(e) => setFormData({ ...formData, accessMethod: 'link' })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Invite Link Only - Members join using a unique invite code
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="accessMethod"
                        value="request"
                        checked={formData.accessMethod === 'request'}
                        onChange={(e) => setFormData({ ...formData, accessMethod: 'request' })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Request Only - Members must request to join and be approved
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="accessMethod"
                        value="both"
                        checked={formData.accessMethod === 'both'}
                        onChange={(e) => setFormData({ ...formData, accessMethod: 'both' })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Both Options - Members can use invite link or request to join
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Group Limits</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Maximum 20 members per group</li>
                <li>• 1 group administrator</li>
                <li>• Admin can manage members and settings</li>
                <li>• All members can post and reply</li>
              </ul>
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
