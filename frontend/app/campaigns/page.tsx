'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

interface Segment {
  id: string;
  name: string;
  rulesJson: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Campaign {
  id: string;
  name: string;
  messageTemplate?: string;
  status: string;
  segmentId?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  segment?: {
    id: string;
    name: string;
  };
  communicationLogs?: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
}

interface MessageSuggestion {
  id: string;
  text: string;
  tone: string;
  reasoning: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    fetchCampaigns();
    fetchSegments();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/api/campaigns');
      setCampaigns(response.data.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSegments = async () => {
    try {
      const response = await api.get('/api/segments');
      setSegments(response.data.data);
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await api.delete(`/api/campaigns/${id}`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="flex items-center justify-between px-12 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-8" style={{marginLeft: '70px'}}>
            <Link href="/" className="text-2xl font-bold text-black">FlowCRM®</Link>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">
                Dashboard
              </Link>
              <Link href="/customers" className="text-gray-500 hover:text-gray-700 transition-colors">
                Customers
              </Link>
              <Link href="/campaigns" className="text-black font-medium">
                Campaigns
              </Link>
            </nav>
          </div>
          <button className="bg-black text-white px-3 py-1.5 rounded-2xl hover:bg-gray-800 transition-colors text-sm" style={{marginRight: '70px'}}>
            Logout
          </button>
        </header>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-lg">Loading campaigns...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-12 py-4 border-b border-gray-200">
        {/* Left side - Brand and Navigation */}
        <div className="flex items-center space-x-8" style={{marginLeft: '70px'}}>
          <Link href="/" className="text-2xl font-bold text-black">FlowCRM®</Link>
          <nav className="flex space-x-6">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <Link href="/customers" className="text-gray-500 hover:text-gray-700 transition-colors">
              Customers
            </Link>
            <Link href="/campaigns" className="text-black font-medium">
              Campaigns
            </Link>
          </nav>
        </div>
        
        {/* Right side - Logout Button */}
        <button className="bg-black text-white px-3 py-1.5 rounded-2xl hover:bg-gray-800 transition-colors text-sm" style={{marginRight: '70px'}}>
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Campaigns</h1>
          <p className="mt-2 text-gray-600">
            Create and manage marketing campaigns with AI-powered message suggestions
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create New Campaign
          </button>
        </div>

        {showCreateForm && (
          <CampaignForm
            segments={segments}
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              fetchCampaigns();
            }}
          />
        )}

        {editingCampaign && (
          <CampaignForm
            campaign={editingCampaign}
            segments={segments}
            onClose={() => setEditingCampaign(null)}
            onSuccess={() => {
              setEditingCampaign(null);
              fetchCampaigns();
            }}
          />
        )}

        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Campaigns</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {campaigns.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No campaigns found. Create your first campaign to get started.
              </div>
            ) : (
              campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onEdit={setEditingCampaign}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CampaignCard({ 
  campaign, 
  onEdit, 
  onDelete 
}: { 
  campaign: Campaign; 
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800';
      case 'SENT': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStats = () => {
    if (!campaign.communicationLogs) return null;
    
    const total = campaign.communicationLogs.length;
    const sent = campaign.communicationLogs.filter(log => log.status === 'SENT').length;
    const failed = campaign.communicationLogs.filter(log => log.status === 'FAILED').length;
    const pending = campaign.communicationLogs.filter(log => log.status === 'PENDING').length;

    return { total, sent, failed, pending };
  };

  const stats = getStats();

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
              {campaign.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mt-1">
            {campaign.segment ? `Target: ${campaign.segment.name}` : 'No segment assigned'}
            {campaign.scheduledAt && ` • Scheduled: ${new Date(campaign.scheduledAt).toLocaleDateString()}`}
          </p>
          
          {campaign.messageTemplate && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              "{campaign.messageTemplate}"
            </p>
          )}

          {stats && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Total: {stats.total}</span>
              <span className="text-green-600">Sent: {stats.sent}</span>
              <span className="text-yellow-600">Pending: {stats.pending}</span>
              {stats.failed > 0 && <span className="text-red-600">Failed: {stats.failed}</span>}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-1">
            Created: {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(campaign)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(campaign.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function CampaignForm({ 
  campaign, 
  segments,
  onClose, 
  onSuccess 
}: { 
  campaign?: Campaign; 
  segments: Segment[];
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [name, setName] = useState(campaign?.name || '');
  const [messageTemplate, setMessageTemplate] = useState(campaign?.messageTemplate || '');
  const [segmentId, setSegmentId] = useState(campaign?.segmentId || '');
  const [scheduledAt, setScheduledAt] = useState(
    campaign?.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : ''
  );
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<MessageSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [objective, setObjective] = useState('');
  const [campaignType, setCampaignType] = useState<'promotional' | 'reengagement' | 'announcement' | 'reminder'>('promotional');
  const [tone, setTone] = useState<'friendly' | 'professional' | 'urgent' | 'casual'>('friendly');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name,
        messageTemplate,
        segmentId: segmentId || undefined,
        scheduledAt: scheduledAt || undefined,
      };

      if (campaign) {
        await api.put(`/api/campaigns/${campaign.id}`, data);
      } else {
        await api.post('/api/campaigns', data);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Error saving campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestMessages = async () => {
    if (!objective.trim()) {
      alert('Please enter a campaign objective first');
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await api.post('/api/ai/message-suggest', {
        objective: objective.trim(),
        segmentId: segmentId || undefined,
        campaignType,
        tone
      });

      setAiSuggestions(response.data.data.suggestions);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      alert('Error getting AI suggestions. Please try again.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: MessageSuggestion) => {
    setMessageTemplate(suggestion.text);
    setAiSuggestions([]); // Close suggestions
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {campaign ? 'Edit Campaign' : 'Create New Campaign'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Segment
              </label>
              <select
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a segment (optional)</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Type
              </label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="promotional">Promotional</option>
                <option value="reengagement">Re-engagement</option>
                <option value="announcement">Announcement</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="urgent">Urgent</option>
                <option value="casual">Casual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Objective
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="e.g., Announce Diwali sale to high-value inactive customers"
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe what you want to achieve with this campaign. This helps AI generate better message suggestions.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Message Template
              </label>
              <button
                type="button"
                onClick={handleSuggestMessages}
                disabled={loadingSuggestions || !objective.trim()}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingSuggestions ? 'Generating...' : '🤖 Suggest Messages'}
              </button>
            </div>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter your message template or use AI suggestions..."
            />
          </div>

          {aiSuggestions.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-3">AI Message Suggestions</h4>
              <div className="space-y-3">
                {aiSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="bg-white border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-1">"{suggestion.text}"</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {suggestion.tone}
                          </span>
                          <span>{suggestion.reasoning}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="ml-3 bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
                      >
                        Use This
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setAiSuggestions([])}
                className="mt-3 text-xs text-purple-600 hover:text-purple-800"
              >
                Close suggestions
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date & Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (campaign ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}