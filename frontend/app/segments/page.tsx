'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { segmentsApi, Segment as ApiSegment, RulesGroup, Rule } from '../../lib/segments';

interface LocalRule {
  id: string;
  field: string;
  operator: string;
  value: string | number;
}

interface LocalRuleGroup {
  id: string;
  operator: 'AND' | 'OR';
  rules: LocalRule[];
}

export default function SegmentsPage() {
  const router = useRouter();
  const [segments, setSegments] = useState<ApiSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'create'>('list');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const response = await segmentsApi.getAll();
      setSegments(response.data);
    } catch (error) {
      console.error('Error fetching segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fieldOptions = [
    'visits_count',
    'last_active', 
    'total_spend',
    'created_at',
    'name',
    'email',
    'phone'
  ];

  const operatorOptions = [
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' },
    { value: '=', label: '=' },
    { value: '!=', label: '!=' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'not contains' }
  ];

  if (currentView === 'create') {
    return (
        <CreateSegmentPage 
          onBack={() => setCurrentView('list')}
          onSuccess={() => {
            setCurrentView('list');
            fetchSegments();
          }}
          fieldOptions={fieldOptions}
          operatorOptions={operatorOptions}
        />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Customer Segments</h1>
          <p className="mt-2 text-gray-600">
            Create and manage customer segments using flexible rules
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setCurrentView('create')}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create New Segment
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading segments...</div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">All Segments</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {segments.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  No segments found. Create your first segment to get started.
                </div>
              ) : (
                segments.map((segment) => (
                  <SegmentCard key={segment.id} segment={segment} />
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="relative">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-black">XenoCRM</Link>
          <nav className="hidden md:flex space-x-2 lg:space-x-6">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors text-sm lg:text-base">
              Dashboard
            </Link>
            <Link href="/customers" className="text-gray-500 hover:text-gray-700 transition-colors text-sm lg:text-base">
              Customers
            </Link>
            <Link href="/orders" className="text-gray-500 hover:text-gray-700 transition-colors text-sm lg:text-base">
              Orders
            </Link>
            <Link href="/campaigns" className="text-gray-500 hover:text-gray-700 transition-colors text-sm lg:text-base">
              Campaigns
            </Link>
            <Link href="/segments" className="text-black font-medium text-sm lg:text-base">
              Segments
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <button 
            onClick={() => {
              localStorage.removeItem('isAuthenticated');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/signin');
            }}
            className="bg-black text-white px-2 sm:px-3 py-1.5 rounded-2xl hover:bg-gray-800 transition-colors text-xs sm:text-sm" 
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <nav className="flex flex-col space-y-1 px-4 py-2">
            <Link 
              href="/dashboard" 
              className="text-gray-500 hover:text-gray-700 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/customers" 
              className="text-gray-500 hover:text-blue-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-blue-100 text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Customers
            </Link>
            <Link 
              href="/orders" 
              className="text-gray-500 hover:text-green-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-green-100 text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Orders
            </Link>
            <Link 
              href="/campaigns" 
              className="text-gray-500 hover:text-purple-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-purple-100 text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Campaigns
            </Link>
            <Link 
              href="/segments" 
              className="text-black font-medium px-3 py-2 rounded-lg bg-gray-100 text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Segments
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function SegmentCard({ segment }: { segment: ApiSegment }) {
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [showMatchingCustomers, setShowMatchingCustomers] = useState(false);
  const [matchingCustomers, setMatchingCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const fetchAudienceCount = async () => {
    setLoadingCount(true);
    try {
      const rules = JSON.parse(segment.rulesJson);
      const response = await segmentsApi.getAudienceCount(rules);
      setAudienceCount(response.data.count);
    } catch (error) {
      console.error('Error fetching audience count:', error);
    } finally {
      setLoadingCount(false);
    }
  };

  useEffect(() => {
    fetchAudienceCount();
  }, [segment.rulesJson]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this segment?')) return;
    
    try {
      await segmentsApi.delete(segment.id);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting segment:', error);
      alert('Error deleting segment. Please try again.');
    }
  };

  const viewMatchingCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const rules = JSON.parse(segment.rulesJson);
      const response = await segmentsApi.getMatchingCustomers(rules, 1, 50);
      setMatchingCustomers(response.data.customers);
      setShowMatchingCustomers(true);
    } catch (error) {
      console.error('Error getting matching customers:', error);
      alert('Error getting matching customers. Please try again.');
    } finally {
      setLoadingCustomers(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-4 hover:bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{segment.name}</h3>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium w-fit">
              {loadingCount ? 'Counting...' : audienceCount !== null ? `${audienceCount} customers` : 'Unknown'}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Created by {segment.createdBy}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Created {new Date(segment.createdAt).toLocaleDateString()}
          </p>
          {segment.campaigns.length > 0 && (
            <p className="text-xs sm:text-sm text-gray-500">
              Used in {segment.campaigns.length} campaign{segment.campaigns.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-2">
          <button 
            onClick={viewMatchingCustomers}
            disabled={loadingCustomers}
            className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-green-50 disabled:opacity-50"
          >
            {loadingCustomers ? 'Loading...' : 'View Customers'}
          </button>
          <button className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-blue-50">
            Edit
          </button>
          <button 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* Matching Customers Modal */}
      {showMatchingCustomers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Customers in "{segment.name}"
              </h2>
              <button
                onClick={() => setShowMatchingCustomers(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {matchingCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No customers match this segment.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Showing {matchingCustomers.length} customers
                  </div>
                  {matchingCustomers.map((customer) => (
                    <div key={customer.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{customer.name}</h3>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                          {customer.phone && (
                            <p className="text-sm text-gray-500">{customer.phone}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{customer.totalSpend?.toLocaleString() || 0}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.visitsCount || 0} visits
                          </p>
                          {customer.lastActive && (
                            <p className="text-sm text-gray-500">
                              Last active: {new Date(customer.lastActive).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateSegmentPage({ 
  onBack, 
  onSuccess,
  fieldOptions, 
  operatorOptions 
}: { 
  onBack: () => void;
  onSuccess: () => void;
  fieldOptions: string[];
  operatorOptions: Array<{ value: string; label: string }>;
}) {
  const [segmentName, setSegmentName] = useState('');
  const [description, setDescription] = useState('');
  const [ruleGroups, setRuleGroups] = useState<LocalRuleGroup[]>([
    {
      id: '1',
      operator: 'AND',
      rules: []
    }
  ]);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMatchingCustomers, setShowMatchingCustomers] = useState(false);
  const [matchingCustomers, setMatchingCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const addRuleGroup = () => {
    const newGroup: LocalRuleGroup = {
      id: Date.now().toString(),
      operator: 'AND',
      rules: []
    };
    setRuleGroups([...ruleGroups, newGroup]);
  };

  const removeRuleGroup = (groupId: string) => {
    setRuleGroups(ruleGroups.filter(group => group.id !== groupId));
  };

  const addRule = (groupId: string) => {
    const newRule: LocalRule = {
      id: Date.now().toString(),
      field: '',
      operator: '',
      value: ''
    };
    
    setRuleGroups(ruleGroups.map(group => 
      group.id === groupId 
        ? { ...group, rules: [...group.rules, newRule] }
        : group
    ));
  };

  const removeRule = (groupId: string, ruleId: string) => {
    setRuleGroups(ruleGroups.map(group => 
      group.id === groupId 
        ? { ...group, rules: group.rules.filter(rule => rule.id !== ruleId) }
        : group
    ));
  };

  const updateRule = (groupId: string, ruleId: string, field: string, value: string | number) => {
    setRuleGroups(ruleGroups.map(group => 
      group.id === groupId 
        ? {
            ...group,
            rules: group.rules.map(rule => 
              rule.id === ruleId ? { ...rule, [field]: value } : rule
            )
          }
        : group
    ));
  };

  const updateRuleGroupOperator = (groupId: string, operator: 'AND' | 'OR') => {
    setRuleGroups(ruleGroups.map(group => 
      group.id === groupId ? { ...group, operator } : group
    ));
  };


  const viewMatchingCustomers = async () => {
    setLoadingCustomers(true);
    try {
      // Convert rule groups to the backend format
      const rulesToTest: RulesGroup = {
        op: 'AND',
        rules: ruleGroups.map(group => ({
          op: group.operator,
          rules: group.rules.map(rule => ({
            field: rule.field,
            operator: rule.operator,
            value: rule.value
          }))
        }))
      };

      const response = await segmentsApi.getMatchingCustomers(rulesToTest, 1, 50);
      setMatchingCustomers(response.data.customers);
      setShowMatchingCustomers(true);
    } catch (error) {
      console.error('Error getting matching customers:', error);
      alert('Error getting matching customers. Please check your rules.');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const previewAudienceSize = async () => {
    setLoading(true);
    try {
      // Convert rule groups to the backend format
      const rulesToTest: RulesGroup = {
        op: 'AND',
        rules: ruleGroups.map(group => ({
          op: group.operator,
          rules: group.rules.map(rule => ({
            field: rule.field,
            operator: rule.operator,
            value: rule.value
          }))
        }))
      };

      const response = await segmentsApi.previewAudience(rulesToTest);
      setAudienceCount(response.data.count);
    } catch (error) {
      console.error('Error getting audience count:', error);
      alert('Error getting audience count. Please check your rules.');
    } finally {
      setLoading(false);
    }
  };

  const saveSegment = async () => {
    if (!segmentName.trim()) {
      alert('Please enter a segment name');
      return;
    }
    
    const hasRules = ruleGroups.some(group => group.rules.length > 0);
    if (!hasRules) {
      alert('Please add at least one rule');
      return;
    }

    setLoading(true);
    try {
      // Convert rule groups to the backend format
      const rulesToSave: RulesGroup = {
        op: 'AND',
        rules: ruleGroups.map(group => ({
          op: group.operator,
          rules: group.rules.map(rule => ({
            field: rule.field,
            operator: rule.operator,
            value: rule.value
          }))
        }))
      };

      // Get user ID from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 'default-user';
      
      console.log('Creating segment with data:', {
        name: segmentName,
        description: description,
        rulesJson: JSON.stringify(rulesToSave),
        createdBy: userId
      });

      await segmentsApi.create({
        name: segmentName,
        description: description,
        rulesJson: JSON.stringify(rulesToSave),
        createdBy: userId
      });

      alert('Segment saved successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error saving segment:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      const errorDetails = error.response?.data?.details || 'No additional details';
      console.error('Error details:', errorDetails);
      alert(`Error saving segment: ${errorMessage}\n\nDetails: ${errorDetails}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="px-12 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-black">Create Segment</h1>
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={previewAudienceSize}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Preview Audience Size
            </button>
            <button
              onClick={saveSegment}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Segment'}
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Segment Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Segment Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segment Name *
                </label>
                <input
                  type="text"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  placeholder="Enter segment name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter segment description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>


          {/* Rule Builder */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Rule Builder</h2>
              <button
                onClick={addRuleGroup}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                + Add Rule Group
              </button>
            </div>

            <div className="space-y-4">
              {ruleGroups.map((group, groupIndex) => (
                <div key={group.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Rule Group {groupIndex + 1}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <select
                        value={group.operator}
                        onChange={(e) => updateRuleGroupOperator(group.id, e.target.value as 'AND' | 'OR')}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                      <button
                        onClick={() => removeRuleGroup(group.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.rules.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No rules added yet
                      </div>
                    ) : (
                      group.rules.map((rule, ruleIndex) => (
                        <div key={rule.id} className="flex items-center space-x-3">
                          <select
                            value={rule.field}
                            onChange={(e) => updateRule(group.id, rule.id, 'field', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Field</option>
                            {fieldOptions.map(field => (
                              <option key={field} value={field}>{field}</option>
                            ))}
                          </select>

                          <select
                            value={rule.operator}
                            onChange={(e) => updateRule(group.id, rule.id, 'operator', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Operator</option>
                            {operatorOptions.map(op => (
                              <option key={op.value} value={op.value}>{op.label}</option>
                            ))}
                          </select>

                          <input
                            type="text"
                            value={rule.value}
                            onChange={(e) => updateRule(group.id, rule.id, 'value', e.target.value)}
                            placeholder="Value"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                          <button
                            onClick={() => removeRule(group.id, rule.id)}
                            className="text-red-500 hover:text-red-700 text-xl"
                          >
                            −
                          </button>
                        </div>
                      ))
                    )}

                    <button
                      onClick={() => addRule(group.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Rule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Preview */}
          {audienceCount !== null && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Audience Preview</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-gray-900">{audienceCount}</span>
                  <span className="text-gray-600">Matching Customers</span>
                </div>
                <div className="text-sm text-gray-500">
                  Based on current rules
                </div>
                <button 
                  onClick={viewMatchingCustomers}
                  disabled={loadingCustomers}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <span>👁️</span>
                  <span>{loadingCustomers ? 'Loading...' : 'View Matching Customers'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Button */}
        <button className="fixed bottom-6 right-6 bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
          <span className="text-xl">?</span>
        </button>

        {/* Matching Customers Modal */}
        {showMatchingCustomers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Matching Customers</h2>
                <button
                  onClick={() => setShowMatchingCustomers(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {matchingCustomers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No customers match the current rules.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchingCustomers.map((customer) => (
                      <div key={customer.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{customer.name}</h3>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                            {customer.phone && (
                              <p className="text-sm text-gray-500">{customer.phone}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              ₹{customer.totalSpend?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-gray-500">
                              {customer.visitsCount || 0} visits
                            </p>
                            {customer.lastActive && (
                              <p className="text-sm text-gray-500">
                                Last active: {new Date(customer.lastActive).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}