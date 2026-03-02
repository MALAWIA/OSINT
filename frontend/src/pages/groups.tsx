'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import GroupCard, { CreateGroupModal } from '@/components/groups/GroupCard';
import CommunityCard, { CreateCommunityModal } from '@/components/groups/CommunityCard';

// Types
type AccessMethod = 'link' | 'request' | 'both';

// Mock groups data
const mockGroups = [
  {
    id: 'g1',
    name: 'NSE Tech Investors',
    description: 'Focused on technology and telecommunications stocks listed on the Nairobi Stock Exchange. We analyze trends, share insights, and discuss investment opportunities in the tech sector.',
    avatar: '',
    admin: 'John Kamau',
    members: [
      { id: 'gm1', name: 'John Kamau', avatar: 'JK', role: 'admin' as const, joinedAt: '2024-01-15T10:30:00Z' },
      { id: 'gm2', name: 'Sarah M.', avatar: 'SM', role: 'member' as const, joinedAt: '2024-01-16T14:20:00Z' },
      { id: 'gm3', name: 'Michael O.', avatar: 'MO', role: 'member' as const, joinedAt: '2024-01-17T09:15:00Z' },
      { id: 'gm4', name: 'Grace W.', avatar: 'GW', role: 'member' as const, joinedAt: '2024-01-18T16:45:00Z' },
      { id: 'gm5', name: 'David K.', avatar: 'DK', role: 'member' as const, joinedAt: '2024-01-19T11:30:00Z' }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    isPrivate: false,
    maxMembers: 20
  },
  {
    id: 'g2',
    name: 'Banking Sector Bulls',
    description: 'Dedicated to analyzing banking stocks and financial sector opportunities. Weekly discussions on KCB, Equity, Co-op Bank and other financial institutions.',
    avatar: '',
    admin: 'Peter Njoroge',
    members: [
      { id: 'gm6', name: 'Peter Njoroge', avatar: 'PN', role: 'admin' as const, joinedAt: '2024-01-20T08:00:00Z' },
      { id: 'gm7', name: 'Lucy M.', avatar: 'LM', role: 'member' as const, joinedAt: '2024-01-21T13:15:00Z' },
      { id: 'gm8', name: 'Anthony K.', avatar: 'AK', role: 'member' as const, joinedAt: '2024-01-22T10:45:00Z' }
    ],
    createdAt: '2024-01-20T08:00:00Z',
    isPrivate: true,
    maxMembers: 20,
    accessMethod: 'both' as AccessMethod,
    inviteLink: 'INVITE-ABC123XYZ',
    joinRequests: [
      {
        id: 'jr1',
        userId: 'u1',
        userName: 'Alice Johnson',
        userAvatar: 'AJ',
        message: 'I\'m a banking professional with 5 years experience. Would love to join your discussions.',
        requestedAt: '2024-02-10T10:30:00Z',
        status: 'pending' as const
      }
    ]
  },
  {
    id: 'g3',
    name: 'Dividend Investors Kenya',
    description: 'Focus on high-dividend yielding stocks and income investing strategies. Perfect for conservative investors seeking regular income from NSE-listed companies.',
    avatar: '',
    admin: 'Samuel M.',
    members: [
      { id: 'gm9', name: 'Samuel M.', avatar: 'SM', role: 'admin' as const, joinedAt: '2024-01-25T15:30:00Z' },
      { id: 'gm10', name: 'Robert W.', avatar: 'RW', role: 'member' as const, joinedAt: '2024-01-26T09:20:00Z' },
      { id: 'gm11', name: 'James T.', avatar: 'JT', role: 'member' as const, joinedAt: '2024-01-27T14:10:00Z' }
    ],
    createdAt: '2024-01-25T15:30:00Z',
    isPrivate: false,
    maxMembers: 20
  }
];

// Mock communities data
const mockCommunities = [
  {
    id: 'c1',
    name: 'Kenya Investors Network',
    description: 'A comprehensive community for all Kenyan investors. From beginners to experts, we share knowledge, analysis, and investment strategies across all sectors listed on NSE.',
    avatar: '',
    admins: [
      { id: 'ca1', name: 'John Kamau', avatar: 'JK', role: 'admin' as const, joinedAt: '2024-01-10T08:00:00Z' },
      { id: 'ca2', name: 'Sarah M.', avatar: 'SM', role: 'admin' as const, joinedAt: '2024-01-11T10:30:00Z' },
      { id: 'ca3', name: 'Michael O.', avatar: 'MO', role: 'admin' as const, joinedAt: '2024-01-12T14:15:00Z' },
      { id: 'ca4', name: 'Grace W.', avatar: 'GW', role: 'admin' as const, joinedAt: '2024-01-13T09:45:00Z' },
      { id: 'ca5', name: 'David K.', avatar: 'DK', role: 'admin' as const, joinedAt: '2024-01-14T16:20:00Z' }
    ],
    members: [
      { id: 'cm1', name: 'Peter N.', avatar: 'PN', role: 'member' as const, joinedAt: '2024-01-15T11:30:00Z' },
      { id: 'cm2', name: 'Lucy M.', avatar: 'LM', role: 'member' as const, joinedAt: '2024-01-16T13:45:00Z' },
      { id: 'cm3', name: 'Anthony K.', avatar: 'AK', role: 'member' as const, joinedAt: '2024-01-17T10:15:00Z' }
    ],
    createdAt: '2024-01-10T08:00:00Z',
    isPublic: true,
    maxMembers: 200,
    category: 'Investment',
    rules: ['Be respectful to all members', 'No financial advice without disclaimers', 'Stay on topic', 'No spam or self-promotion']
  },
  {
    id: 'c2',
    name: 'NSE Technical Analysis',
    description: 'Professional community for technical analysts and chart enthusiasts. We share chart patterns, technical indicators, and trading strategies based on technical analysis.',
    avatar: '',
    admins: [
      { id: 'ca6', name: 'Robert W.', avatar: 'RW', role: 'admin' as const, joinedAt: '2024-01-18T12:00:00Z' },
      { id: 'ca7', name: 'James T.', avatar: 'JT', role: 'admin' as const, joinedAt: '2024-01-19T15:30:00Z' },
      { id: 'ca8', name: 'Alice M.', avatar: 'AM', role: 'admin' as const, joinedAt: '2024-01-20T09:15:00Z' }
    ],
    members: [
      { id: 'cm4', name: 'Samuel K.', avatar: 'SK', role: 'member' as const, joinedAt: '2024-01-21T14:20:00Z' },
      { id: 'cm5', name: 'Benjamin O.', avatar: 'BO', role: 'member' as const, joinedAt: '2024-01-22T11:45:00Z' }
    ],
    createdAt: '2024-01-18T12:00:00Z',
    isPublic: true,
    maxMembers: 200,
    category: 'Technology',
    rules: ['Technical analysis focus only', 'Share charts with explanations', 'Respect different analysis styles', 'No fundamental analysis discussions']
  },
  {
    id: 'c3',
    name: 'Banking & Finance Professionals',
    description: 'Exclusive community for banking and finance professionals. Discuss industry trends, regulatory changes, and career development in the Kenyan financial sector.',
    avatar: '',
    admins: [
      { id: 'ca9', name: 'Lucy Muthoni', avatar: 'LM', role: 'admin' as const, joinedAt: '2024-01-22T10:00:00Z' }
    ],
    members: [
      { id: 'cm6', name: 'Anthony Kirui', avatar: 'AK', role: 'member' as const, joinedAt: '2024-01-23T13:30:00Z' },
      { id: 'cm7', name: 'Peter Njoroge', avatar: 'PN', role: 'member' as const, joinedAt: '2024-01-24T16:15:00Z' }
    ],
    createdAt: '2024-01-22T10:00:00Z',
    isPublic: false,
    maxMembers: 200,
    category: 'Banking',
    rules: ['Professional conduct required', 'Confidentiality respected', 'No insider information sharing', 'Career development focus']
  }
];

export default function GroupsPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState(mockGroups);
  const [communities, setCommunities] = useState(mockCommunities);
  const [activeTab, setActiveTab] = useState<'groups' | 'communities'>('groups');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'member' | 'admin'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error('Error loading groups:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateGroup = (newGroup: any) => {
    const groupWithId = {
      ...newGroup,
      id: `g${Date.now()}`,
      members: [
        {
          id: 'current_user',
          name: 'You',
          avatar: 'YU',
          role: 'admin' as const,
          joinedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    setGroups([groupWithId, ...groups]);
  };

  const handleCreateCommunity = (newCommunity: any) => {
    const communityWithId = {
      ...newCommunity,
      id: `c${Date.now()}`,
      admins: [
        {
          id: 'current_user',
          name: 'You',
          avatar: 'YU',
          role: 'admin' as const,
          joinedAt: new Date().toISOString()
        }
      ],
      members: [],
      createdAt: new Date().toISOString()
    };
    setCommunities([communityWithId, ...communities]);
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: [
            ...group.members,
            {
              id: 'current_user',
              name: 'You',
              avatar: 'YU',
              role: 'member' as const,
              joinedAt: new Date().toISOString()
            }
          ]
        };
      }
      return group;
    }));
  };

  const handleJoinCommunity = (communityId: string) => {
    setCommunities(communities.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          members: [
            ...community.members,
            {
              id: 'current_user',
              name: 'You',
              avatar: 'YU',
              role: 'member' as const,
              joinedAt: new Date().toISOString()
            }
          ]
        };
      }
      return community;
    }));
  };

  const handleLeaveGroup = (groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.members.filter(member => member.id !== 'current_user')
        };
      }
      return group;
    }));
  };

  const handleLeaveCommunity = (communityId: string) => {
    setCommunities(communities.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          members: community.members.filter(member => member.id !== 'current_user'),
          admins: community.admins.filter(admin => admin.id !== 'current_user')
        };
      }
      return community;
    }));
  };

  // New handlers for private group access
  const handleRequestJoin = (groupId: string, message: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        const newRequest = {
          id: `jr${Date.now()}`,
          userId: 'current_user',
          userName: 'You',
          userAvatar: 'YU',
          message,
          requestedAt: new Date().toISOString(),
          status: 'pending' as const
        };
        
        return {
          ...group,
          accessMethod: group.accessMethod || 'both' as AccessMethod,
          inviteLink: group.inviteLink,
          joinRequests: [...(group.joinRequests || []), newRequest]
        };
      }
      return group;
    }));
    
    // Show success message (in real app, this would be a toast/notification)
    alert('Join request sent successfully! The group admin will review your request.');
  };

  const handleJoinWithLink = (groupId: string, inviteCode: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group && group.inviteLink === inviteCode) {
      handleJoinGroup(groupId);
      alert('Successfully joined the group!');
    } else {
      alert('Invalid invite code. Please check with the group admin.');
    }
  };

  const handleCopyInviteLink = (inviteLink: string) => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserRoleInGroup = (group: any) => {
    const userMember = group.members.find((m: any) => m.id === 'current_user');
    if (userMember) return userMember.role;
    return 'non-member';
  };

  const getUserRoleInCommunity = (community: any) => {
    const userAdmin = community.admins.find((a: any) => a.id === 'current_user');
    if (userAdmin) return 'admin';
    const userMember = community.members.find((m: any) => m.id === 'current_user');
    if (userMember) return 'member';
    return 'non-member';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm mt-3">Loading groups and communities...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Groups & Communities</h1>
          <p className="text-gray-600">Connect with like-minded investors and join specialized communities</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Create Group (Max 20)
          </button>
          <button
            onClick={() => setShowCreateCommunityModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + Create Community (Max 200)
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search groups and communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="member">My Groups/Communities</option>
            <option value="admin">Admin Of</option>
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'groups'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Groups ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'communities'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏛️ Communities ({communities.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'groups' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                currentUserRole={getUserRoleInGroup(group)}
                onJoin={handleJoinGroup}
                onLeave={handleLeaveGroup}
                onView={(id) => console.log('View group:', id)}
                onRequestJoin={handleRequestJoin}
                onJoinWithLink={handleJoinWithLink}
                onCopyInviteLink={handleCopyInviteLink}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                currentUserRole={getUserRoleInCommunity(community)}
                onJoin={handleJoinCommunity}
                onLeave={handleLeaveCommunity}
                onView={(id) => console.log('View community:', id)}
              />
            ))}
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'groups' && filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or create your own group</p>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create a Group
            </button>
          </div>
        )}

        {activeTab === 'communities' && filteredCommunities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-4xl mb-4">🏛️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or start your own community</p>
            <button
              onClick={() => setShowCreateCommunityModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create a Community
            </button>
          </div>
        )}

        {/* Modals */}
        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          onCreate={handleCreateGroup}
        />

        <CreateCommunityModal
          isOpen={showCreateCommunityModal}
          onClose={() => setShowCreateCommunityModal(false)}
          onCreate={handleCreateCommunity}
        />
      </div>
    </MainLayout>
  );
}
