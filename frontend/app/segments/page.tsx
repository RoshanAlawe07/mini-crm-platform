'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [segments, setSegments] = useState<ApiSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'create'>('list');

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
  return (
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
          <Link href="/orders" className="text-gray-500 hover:text-gray-700 transition-colors">
            Orders
          </Link>
          <Link href="/campaigns" className="text-gray-500 hover:text-gray-700 transition-colors">
            Campaigns
          </Link>
          <Link href="/segments" className="text-black font-medium">
            Segments
          </Link>
        </nav>
      </div>
      
      <button className="bg-black text-white px-3 py-1.5 rounded-2xl hover:bg-gray-800 transition-colors text-sm" style={{marginRight: '70px'}}>
        Logout
      </button>
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
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-gray-900">{segment.name}</h3>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              {loadingCount ? 'Counting...' : audienceCount !== null ? `${audienceCount} customers` : 'Unknown'}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Created by {segment.createdBy}
          </p>
          <p className="text-sm text-gray-500">
            Created {new Date(segment.createdAt).toLocaleDateString()}
          </p>
          {segment.campaigns.length > 0 && (
            <p className="text-sm text-gray-500">
              Used in {segment.campaigns.length} campaign{segment.campaigns.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={viewMatchingCustomers}
            disabled={loadingCustomers}
            className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
          >
            {loadingCustomers ? 'Loading...' : 'View Customers'}
          </button>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Edit
          </button>
          <button 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
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
  const [aiHelperText, setAiHelperText] = useState('');
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

  const convertAiToRules = async () => {
    if (!aiHelperText.trim()) {
      alert('Please enter a prompt for AI Helper');
      return;
    }

    setLoading(true);
    try {
      const response = await segmentsApi.aiHelperConvert(aiHelperText);
      const { rules } = response.data;
      
      // Convert the backend rules format to local format
      if ('field' in rules) {
        // Single rule
        const newRule: LocalRule = {
          id: Date.now().toString(),
          field: rules.field,
          operator: rules.operator,
          value: rules.value
        };
        
        setRuleGroups([{
          id: '1',
          operator: 'AND',
          rules: [newRule]
        }]);
      } else {
        // Rules group - convert to local format
        const convertedGroups: LocalRuleGroup[] = rules.rules.map((group: any, index: number) => ({
          id: (index + 1).toString(),
          operator: group.op,
          rules: group.rules.map((rule: any) => ({
            id: Date.now().toString() + Math.random(),
            field: rule.field,
            operator: rule.operator,
            value: rule.value
          }))
        }));
        
        setRuleGroups(convertedGroups);
      }
      
      alert('AI Helper converted your prompt to rules!');
    } catch (error) {
      console.error('Error converting AI prompt:', error);
      alert('Error converting AI prompt. Please try again.');
    } finally {
      setLoading(false);
    }
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

      await segmentsApi.create({
        name: segmentName,
        description: description,
        rulesJson: JSON.stringify(rulesToSave),
        createdBy: 'Current User' // You might want to get this from auth context
      });

      alert('Segment saved successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error saving segment:', error);
      alert('Error saving segment. Please try again.');
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

          {/* AI Helper */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">AI Helper</h2>
            </div>
            <div className="flex space-x-3">
              <input
                type="text"
                value={aiHelperText}
                onChange={(e) => setAiHelperText(e.target.value)}
                placeholder="Example: Customers inactive for 6 months & spent > 5000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={convertAiToRules}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Convert to Rules
              </button>
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