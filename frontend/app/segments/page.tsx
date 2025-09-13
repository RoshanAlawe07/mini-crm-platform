'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { segmentsApi } from '../../lib/segments';

interface Rule {
  field: string;
  operator: string;
  value: any;
}

interface RulesGroup {
  op: 'AND' | 'OR';
  rules: (Rule | RulesGroup)[];
}

interface Segment {
  id: string;
  name: string;
  rulesJson: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  campaigns: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const response = await segmentsApi.getAll();
      setSegments(response.data);
    } catch (error) {
      console.error('Error fetching segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) return;
    
    try {
      await segmentsApi.delete(id);
      fetchSegments();
    } catch (error) {
      console.error('Error deleting segment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading segments...</div>
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
            <Link href="/campaigns" className="text-gray-500 hover:text-gray-700 transition-colors">
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
          <h1 className="text-3xl font-bold text-black">Customer Segments</h1>
          <p className="mt-2 text-gray-600">
            Create and manage customer segments using flexible rules
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Segment
          </button>
        </div>

        {showCreateForm && (
          <SegmentForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              fetchSegments();
            }}
          />
        )}

        {editingSegment && (
          <SegmentForm
            segment={editingSegment}
            onClose={() => setEditingSegment(null)}
            onSuccess={() => {
              setEditingSegment(null);
              fetchSegments();
            }}
          />
        )}

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
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  onEdit={setEditingSegment}
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

function SegmentCard({ 
  segment, 
  onEdit, 
  onDelete 
}: { 
  segment: Segment; 
  onEdit: (segment: Segment) => void;
  onDelete: (id: string) => void;
}) {
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const rules = JSON.parse(segment.rulesJson);

  const fetchAudienceCount = useCallback(async () => {
    setLoadingCount(true);
    try {
      const response = await segmentsApi.getAudienceCount(rules);
      setAudienceCount(response.data.count);
    } catch (error) {
      console.error('Error fetching audience count:', error);
    } finally {
      setLoadingCount(false);
    }
  }, [rules]);

  useEffect(() => {
    fetchAudienceCount();
  }, [fetchAudienceCount]);

  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-gray-900">{segment.name}</h3>
            <div className="flex items-center gap-2">
              {loadingCount ? (
                <div className="text-sm text-gray-400">Counting...</div>
              ) : (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {audienceCount !== null ? `${audienceCount} customers` : 'Unknown'}
                </div>
              )}
              <button
                onClick={fetchAudienceCount}
                className="text-xs text-gray-500 hover:text-gray-700"
                title="Refresh count"
              >
                ↻
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Created by {segment.createdBy} • {new Date(segment.createdAt).toLocaleDateString()}
          </p>
          <div className="mt-2">
            <RulesDisplay rules={rules} />
          </div>
          {segment.campaigns.length > 0 && (
            <div className="mt-2">
              <span className="text-sm text-gray-500">
                Used in {segment.campaigns.length} campaign{segment.campaigns.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(segment)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(segment.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function RulesDisplay({ rules }: { rules: RulesGroup | Rule }) {
  if ('field' in rules) {
    // Single rule
    return (
      <div className="text-sm text-gray-600">
        <span className="font-medium">{rules.field}</span> {rules.operator} {String(rules.value)}
      </div>
    );
  } else {
    // Rules group
    return (
      <div className="text-sm text-gray-600">
        <span className="font-medium">({rules.op})</span>
        <div className="ml-4 mt-1 space-y-1">
          {rules.rules.map((rule, index) => (
            <div key={index}>
              <RulesDisplay rules={rule} />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

function SegmentForm({ 
  segment, 
  onClose, 
  onSuccess 
}: { 
  segment?: Segment; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [name, setName] = useState(segment?.name || '');
  const [createdBy, setCreatedBy] = useState(segment?.createdBy || '');
  const [rules, setRules] = useState<RulesGroup | Rule>(
    segment ? JSON.parse(segment.rulesJson) : {
      op: 'AND',
      rules: []
    }
  );
  const [loading, setLoading] = useState(false);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState<string | null>(null);

  // Debounced function to update audience count
  const updateAudienceCount = useCallback(async (rulesToTest: RulesGroup | Rule) => {
    setLoadingCount(true);
    setRulesError(null);
    
    try {
      const response = await segmentsApi.getAudienceCount(rulesToTest);
      setAudienceCount(response.data.count);
    } catch (error: any) {
      setRulesError(error.response?.data?.error || 'Invalid rules format');
      setAudienceCount(null);
    } finally {
      setLoadingCount(false);
    }
  }, []);

  // Generate SQL query for debugging
  const generateSqlQuery = useCallback(async (rulesToTest: RulesGroup | Rule) => {
    try {
      const response = await segmentsApi.generateSqlQuery(rulesToTest);
      setSqlQuery(response.data.countSql);
    } catch (error) {
      console.error('Error generating SQL:', error);
    }
  }, []);

  // Update audience count when rules change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (rules && (rules as RulesGroup).rules?.length > 0) {
        updateAudienceCount(rules);
        generateSqlQuery(rules);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [rules, updateAudienceCount, generateSqlQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name,
        rulesJson: JSON.stringify(rules),
        createdBy,
      };

      if (segment) {
        await segmentsApi.update(segment.id, data);
      } else {
        await segmentsApi.create(data);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving segment:', error);
      alert('Error saving segment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {segment ? 'Edit Segment' : 'Create New Segment'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segment Name
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
              Created By
            </label>
            <input
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Rules (JSON Format)
              </label>
              <div className="flex items-center gap-3">
                {loadingCount ? (
                  <div className="text-sm text-gray-400">Counting...</div>
                ) : audienceCount !== null ? (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    {audienceCount} customers
                  </div>
                ) : rulesError ? (
                  <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    Invalid rules
                  </div>
                ) : null}
              </div>
            </div>
            <textarea
              value={JSON.stringify(rules, null, 2)}
              onChange={(e) => {
                try {
                  const newRules = JSON.parse(e.target.value);
                  setRules(newRules);
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 font-mono text-sm ${
                rulesError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              rows={8}
              placeholder='{
  "op": "OR",
  "rules": [
    {
      "op": "AND",
      "rules": [
        { "field": "total_spend", "operator": ">", "value": 10000 },
        { "field": "visits_count", "operator": "<", "value": 3 }
      ]
    },
    { "field": "last_active", "operator": "<", "value": "2025-01-01" }
  ]
}'
            />
            {rulesError && (
              <p className="text-xs text-red-600 mt-1">{rulesError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Use the JSON format to define your segment rules. Available fields: total_spend, visits_count, last_active, name, email, phone, created_at
            </p>
            
            {sqlQuery && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-600 mb-2 font-medium">Generated SQL Query:</p>
                <code className="text-xs text-gray-700 block break-all">{sqlQuery}</code>
              </div>
            )}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (segment ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
