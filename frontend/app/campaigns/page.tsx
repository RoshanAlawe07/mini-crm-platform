'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CampaignsPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'list' | 'create'>('list');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSegments();
    fetchCampaigns();
  }, []);

  const fetchSegments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/segments`);
      const data = await response.json();
      setSegments(data.data || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/campaigns`);
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.data || []);
      } else {
        console.error('Error fetching campaigns:', data.error);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  if (currentView === 'create') {
    return (
      <CreateCampaignPage 
        segments={segments}
        onBack={() => setCurrentView('list')}
        onSuccess={() => {
          setCurrentView('list');
          fetchCampaigns();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Campaigns</h1>
          <p className="mt-2 text-gray-600">
            Create and manage marketing campaigns for your customers
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setCurrentView('create')}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create New Campaign
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading campaigns...</div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
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
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Header() {
  const router = useRouter();
  
  return (
    <header className="flex items-center justify-between px-12 py-4 border-b border-gray-200">
      <div className="flex items-center space-x-8" style={{marginLeft: '70px'}}>
        <Link href="/" className="text-2xl font-bold text-black">XenoCRM</Link>
        <nav className="flex space-x-6">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">
            Dashboard
          </Link>
          <Link href="/customers" className="text-gray-500 hover:text-gray-700 transition-colors">
            Customers
          </Link>
          <Link href="/orders" className="text-gray-500 hover:text-gray-700 transition-colors">
            Orders
          </Link>
          <Link href="/campaigns" className="text-black font-medium">
            Campaigns
          </Link>
          <Link href="/segments" className="text-gray-500 hover:text-gray-700 transition-colors">
            Segments
          </Link>
        </nav>
      </div>
      
      <button 
        onClick={() => {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/signin');
        }}
        className="bg-black text-white px-3 py-1.5 rounded-2xl hover:bg-gray-800 transition-colors text-sm" 
        style={{marginRight: '70px'}}
      >
        Sign Out
      </button>
    </header>
  );
}

function CampaignCard({ campaign }: { campaign: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800';
      case 'SENT': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/campaigns/${campaign.id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert(`Campaign "${campaign.name}" deleted successfully!`);
          // Refresh the campaigns list
          window.location.reload();
        } else {
          const result = await response.json();
          alert(`Error deleting campaign: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Error deleting campaign. Please try again.');
      }
    }
  };

  const handleLaunch = async () => {
    if (confirm(`Are you sure you want to launch "${campaign.name}"?`)) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/campaigns/${campaign.id}/launch`, {
          method: 'POST'
        });
        
        if (response.ok) {
          alert(`Campaign "${campaign.name}" launched successfully!`);
          // Refresh the campaigns list
          window.location.reload();
        } else {
          const result = await response.json();
          alert(`Error launching campaign: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error launching campaign:', error);
        alert('Error launching campaign. Please try again.');
      }
    }
  };

  const handleSendMessages = async () => {
    if (confirm(`Are you sure you want to send messages for "${campaign.name}"?`)) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/campaigns/${campaign.id}/send-messages`, {
          method: 'POST'
        });
        
        if (response.ok) {
          alert(`Messages sent successfully for "${campaign.name}"!`);
          // Refresh the campaigns list
          window.location.reload();
        } else {
          const result = await response.json();
          alert(`Error sending messages: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error sending messages:', error);
        alert('Error sending messages. Please try again.');
      }
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status || 'DRAFT')}`}>
              {campaign.status || 'DRAFT'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {campaign.segment ? `Target: ${campaign.segment.name}` : 'No segment assigned'}
          </p>
          {campaign.messageTemplate && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              "{campaign.messageTemplate}"
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Created: {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
          
          {/* Message Statistics */}
          {campaign.messageStats && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Message Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Messages:</span>
                  <span className="font-medium">{campaign.messageStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Delivered:</span>
                  <span className="font-medium text-green-600">{campaign.messageStats.sent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Failed:</span>
                  <span className="font-medium text-red-600">{campaign.messageStats.failed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Pending:</span>
                  <span className="font-medium text-yellow-600">{campaign.messageStats.pending}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium text-green-600">{campaign.messageStats.successRate}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-600">Failure Rate:</span>
                  <span className="font-medium text-red-600">{campaign.messageStats.failureRate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {campaign.status === 'DRAFT' && (
            <button 
              onClick={handleLaunch}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Launch
            </button>
          )}
          {campaign.status !== 'DRAFT' && (!campaign.messageStats || campaign.messageStats.total === 0) && (
            <button 
              onClick={handleSendMessages}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Send Messages
            </button>
          )}
          <button 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateCampaignPage({ 
  segments,
  onBack, 
  onSuccess 
}: { 
  segments: any[];
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [campaignName, setCampaignName] = useState('');
  const [targetSegment, setTargetSegment] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);


  const suggestMessage = async () => {
    setAiSuggesting(true);
    try {
      // Simulate AI message suggestion with context awareness
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let suggestion = "";
      const segment = segments.find(s => s.id === targetSegment);
      
      if (segment && segment.name.toLowerCase().includes('high value')) {
        suggestion = "🎉 Exclusive VIP Offer for Our Most Valued Customers!\n\nDear Valued Customer,\n\nAs one of our most important customers, we're thrilled to offer you an exclusive 25% discount on your next purchase. This special VIP offer is valid for 48 hours only and includes free express shipping on orders over $100.\n\nUse code: VIP25\n\nThank you for your continued loyalty and trust in our brand. We appreciate your business and look forward to serving you again soon!\n\nBest regards,\nThe XenoCRM Team";
      } else if (segment && segment.name.toLowerCase().includes('inactive')) {
        suggestion = "We Miss You! 💔 Special Welcome Back Offer\n\nHi there!\n\nWe noticed you haven't visited us in a while, and we wanted to reach out with a special welcome back offer just for you. We're offering 20% off everything in our store plus free shipping on any order over $50.\n\nThis offer is valid for the next 7 days, so don't miss out on the chance to rediscover our amazing products at an incredible price!\n\nUse code: WELCOME20\n\nWe hope to see you back soon!\n\nWarm regards,\nThe XenoCRM Team";
      } else if (segment && segment.name.toLowerCase().includes('new')) {
        suggestion = "Welcome to Our Family! 🌟 First Order Special\n\nWelcome to XenoCRM!\n\nWe're so excited to have you join our community of satisfied customers. To help you get started, we're offering you 15% off your very first order with us.\n\nThis welcome discount is our way of saying thank you for choosing us, and we're confident you'll love the quality and service we provide.\n\nUse code: WELCOME15\n\nHappy shopping!\n\nBest regards,\nThe XenoCRM Team";
      } else {
        const suggestions = [
          "🎉 Special Limited-Time Offer Just for You!\n\nDear Customer,\n\nWe're excited to offer you an exclusive 20% discount on your next purchase. This special offer is valid for the next 5 days and includes free standard shipping on orders over $75.\n\nUse code: SAVE20\n\nDon't miss out on this amazing opportunity to save on our premium products!\n\nBest regards,\nThe XenoCRM Team",
          "Hi! We Miss You - Special Welcome Back Offer\n\nDear Valued Customer,\n\nWe noticed you haven't visited us lately, and we wanted to reach out with a special welcome back offer. Enjoy 15% off everything in our store with free shipping on orders over $60.\n\nThis offer is valid for the next 10 days, so take advantage of these great savings while you can!\n\nUse code: WELCOME15\n\nWe hope to see you back soon!\n\nWarm regards,\nThe XenoCRM Team",
          "Thank You for Being a Valued Customer!\n\nDear Customer,\n\nWe want to express our gratitude for your continued support and trust in our brand. As a token of our appreciation, we're offering you an exclusive 25% discount on your next order.\n\nThis special discount is valid for the next 7 days and includes free express shipping on orders over $100.\n\nUse code: THANKYOU25\n\nThank you for choosing us!\n\nBest regards,\nThe XenoCRM Team",
          "Don't Miss Out! Limited Time Flash Sale\n\nDear Customer,\n\nWe're excited to announce a limited-time flash sale with incredible savings! Get 30% off everything in our store for the next 24 hours only.\n\nThis is one of our biggest sales of the year, so don't wait - shop now and save big on all your favorite products!\n\nUse code: FLASH30\n\nHappy shopping!\n\nBest regards,\nThe XenoCRM Team",
          "🌟 Flash Sale Alert - 30% Off Everything!\n\nDear Customer,\n\nWe're having a massive flash sale and you're invited! Get 30% off everything in our store for the next 24 hours only.\n\nThis incredible offer includes free shipping on orders over $50 and is valid on all products in our catalog.\n\nUse code: FLASH30\n\nShop now before it's gone!\n\nBest regards,\nThe XenoCRM Team"
        ];
        suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      }
      
      setCampaignMessage(suggestion);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
    } finally {
      setAiSuggesting(false);
    }
  };


  const saveCampaign = async (asDraft = false) => {
    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    if (!campaignMessage.trim()) {
      alert('Please enter a campaign message');
      return;
    }

    setLoading(true);
    try {
      const campaignData = {
        name: campaignName,
        messageTemplate: campaignMessage,
        segmentId: targetSegment || null,
        status: asDraft ? 'DRAFT' : 'SCHEDULED',
        rules_json: '{}' // Default empty rules
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      });

      const result = await response.json();

      if (result.success) {
        alert(asDraft ? 'Campaign saved as draft!' : 'Campaign launched successfully!');
        onSuccess();
      } else {
        alert('Error saving campaign: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Error saving campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSegment = segments.find(s => s.id === targetSegment);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Create Campaign</h1>
          <p className="mt-2 text-gray-600">
            Design and launch a new customer campaign.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Campaign Details Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Campaign Details</h2>
            
            <div className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Enter campaign name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Target Segment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Segment
                </label>
                <div className="relative">
                  <select
                    value={targetSegment}
                    onChange={(e) => setTargetSegment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="">Select Segment</option>
                    {segments.map((segment) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Campaign Message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Campaign Message
                  </label>
                  <span className="text-xs text-gray-500">
                    {campaignMessage.length}/500 characters
                  </span>
                </div>
                <textarea
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  placeholder="Enter your campaign message..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  type="button"
                  onClick={suggestMessage}
                  disabled={aiSuggesting}
                  className="mt-2 flex items-center space-x-2 bg-purple-600 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>🪄</span>
                  <span>{aiSuggesting ? 'Generating...' : 'Suggest Message (AI)'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Campaign Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Preview</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">To: </span>
                  <span className="text-sm text-gray-600">
                    {selectedSegment ? `${selectedSegment.name} customers` : 'Sample Customer'}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-900">
                    {campaignMessage || 'Your campaign message will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto mt-8 flex justify-end space-x-4">
          <button
            onClick={() => saveCampaign(true)}
            disabled={loading}
            className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <span>💾</span>
            <span>{loading ? 'Saving...' : 'Save as Draft'}</span>
          </button>
          <button
            onClick={() => saveCampaign(false)}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <span>🚀</span>
            <span>{loading ? 'Launching...' : 'Launch Campaign'}</span>
          </button>
        </div>
      </main>
    </div>
  );
}