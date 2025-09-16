'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpend: number;
  lastActive: string | null;
  visitsCount: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: '',
    fromDate: '',
    toDate: '',
    status: 'all'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch customers from API
  const fetchCustomers = async () => {
    // Prevent multiple simultaneous requests
    if (loading) {
      console.log('⏳ Request already in progress, skipping...');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (filters.search) params.append('search', filters.search);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      
      console.log('Fetching customers with params:', params.toString());
      const response = await api.get(`/api/customers?${params.toString()}`);
      console.log('Customers fetched successfully:', response.data);
      
      setCustomers(response.data.customers || []);
      setPagination(response.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and refresh the page.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to fetch customers');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newCustomer.name.trim() || !newCustomer.email.trim() || !newCustomer.phone.trim()) {
      setError('Name, email, and phone are required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Sending customer data:', newCustomer);
      
      const response = await api.post('/api/customers', newCustomer);
      console.log('Customer added successfully:', response.data);
      
      setNewCustomer({ name: '', email: '', phone: '' });
      setShowAddForm(false);
      fetchCustomers(); // Refresh the list
    } catch (err: any) {
      console.error('Error adding customer:', err);
      setError(err.response?.data?.error || err.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Deleting customer with ID:', customerId);
      const response = await api.delete(`/api/customers/${customerId}`);
      console.log('Delete response:', response);
      
      alert('Customer deleted successfully!');
      fetchCustomers(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete customer';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCustomers();
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    setTimeout(() => {
      fetchCustomers();
    }, 100);
  };

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Listen for order events to refresh customer data
  useEffect(() => {
    const handleOrderAdded = (event: CustomEvent) => {
      console.log('Order added event received, refreshing customer data...');
      fetchCustomers();
    };

    const handleOrderDeleted = (event: CustomEvent) => {
      console.log('Order deleted event received, refreshing customer data...');
      fetchCustomers();
    };

    window.addEventListener('orderAdded', handleOrderAdded as EventListener);
    window.addEventListener('orderDeleted', handleOrderDeleted as EventListener);
    
    return () => {
      window.removeEventListener('orderAdded', handleOrderAdded as EventListener);
      window.removeEventListener('orderDeleted', handleOrderDeleted as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="relative">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 border-b border-gray-200 bg-white">
          {/* Left side - Brand and Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-black">XenoCRM</Link>
            <nav className="hidden md:flex space-x-2 lg:space-x-6">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors text-sm lg:text-base">
                Dashboard
              </Link>
              <Link href="/customers" className="text-black font-medium text-sm lg:text-base">
                Customers
              </Link>
              <Link href="/orders" className="text-gray-500 hover:text-gray-700 transition-colors text-sm lg:text-base">
                Orders
              </Link>
              <Link href="/campaigns" className="text-gray-500 hover:text-gray-700 transition-colors text-sm lg:text-base">
                Campaigns
              </Link>
              <Link href="/segments" className="text-gray-500 hover:text-gray-700 transition-colors text-sm lg:text-base">
                Segments
              </Link>
            </nav>
          </div>
          
          {/* Right side - Mobile Menu and Logout Button */}
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
            
            <button className="bg-black text-white px-2 sm:px-3 py-1.5 rounded-2xl hover:bg-gray-800 transition-colors text-xs sm:text-sm">
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
                className="text-black font-medium px-3 py-2 rounded-lg bg-gray-100 text-sm"
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
                className="text-gray-500 hover:text-orange-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-orange-100 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Segments
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <button 
              onClick={() => {
                setShowAddForm(true);
                setError(null);
                setNewCustomer({ name: '', email: '', phone: '' });
              }}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Customer
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent cursor-pointer"
                  value={filters.fromDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent cursor-pointer"
                  value={filters.toDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleApplyFilters}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="px-6 py-12 text-center text-gray-500">
                Loading customers...
              </div>
            ) : !customers || customers.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No customers found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Spend</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Visits</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Join Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customers.map((customer, index) => (
                        <tr key={customer.id} className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                          <td className="px-6 py-4 text-sm text-gray-900">#{customer.id.slice(-8)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{customer.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{customer.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{customer.phone}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">${customer.totalSpend.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{customer.visitsCount}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="text-red-600 hover:text-red-900 transition-colors" 
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                          </span>{' '}
                          of <span className="font-medium">{pagination.total}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={!pagination.hasPrev}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={!pagination.hasNext}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Customer</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}