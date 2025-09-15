'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  date: string;
  status: string;
  customerId: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
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
    customerId: '',
    fromDate: '',
    toDate: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    amount: '',
    status: 'PENDING'
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (filters.customerId) params.append('customerId', filters.customerId);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      
      console.log('Fetching orders with params:', params.toString());
      const response = await api.get(`/api/orders?${params.toString()}`);
      console.log('Orders fetched successfully:', response.data);
      
      setOrders(response.data.orders || []);
      setPagination(response.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/customers?limit=1000');
      setCustomers(response.data.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  // Add new order
  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Find customer by name
      const customer = customers.find(c => c.name.toLowerCase() === newOrder.customerName.toLowerCase());
      if (!customer) {
        setError('Customer not found. Please select a valid customer name.');
        return;
      }
      
      // Validate amount
      const amount = parseFloat(newOrder.amount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount greater than 0.');
        return;
      }
      
      const orderData = {
        customerId: customer.id,
        amount: parseFloat(newOrder.amount),
        status: newOrder.status
      };
      
      console.log('Sending order data:', orderData);
      console.log('Customer found:', customer);
      console.log('Customer ID type:', typeof customer.id);
      
      const response = await api.post('/api/orders', orderData);
      console.log('Order added successfully:', response.data);
      
      setNewOrder({ customerName: '', amount: '', status: 'PENDING' });
      setShowAddForm(false);
      
      // Refresh the orders list immediately
      await fetchOrders();
      
      // Trigger customer data refresh in other tabs/windows
      window.dispatchEvent(new CustomEvent('orderAdded', { 
        detail: { customerId: customer.id, amount: amount } 
      }));
      
      // Show success message
      setError(null);
    } catch (err: any) {
      console.error('Error adding order:', err);
      setError(err.response?.data?.error || err.message || 'Failed to add order');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    fetchOrders();
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    setTimeout(() => {
      fetchOrders();
    }, 0);
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/api/orders/${orderId}`);
      console.log('Order deleted successfully');
      
      // Trigger customer data refresh in other tabs/windows
      window.dispatchEvent(new CustomEvent('orderDeleted', { 
        detail: { orderId } 
      }));
      
      fetchOrders();
    } catch (err: any) {
      console.error('Error deleting order:', err);
      setError(err.response?.data?.error || err.message || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  // Load orders and customers on component mount
  useEffect(() => {
    console.log('Orders page mounted, fetching orders...');
    fetchOrders();
    fetchCustomers();
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
              <Link href="/customers" className="text-gray-500 hover:text-gray-700 transition-colors text-sm lg:text-base">
                Customers
              </Link>
              <Link href="/orders" className="text-black font-medium text-sm lg:text-base">
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
              Logout
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
                className="text-black font-medium px-3 py-2 rounded-lg bg-gray-100 text-sm"
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
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Order
            </button>
          </div>
        
          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Customer</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={filters.customerId}
                  onChange={(e) => setFilters(prev => ({ ...prev, customerId: e.target.value }))}
                >
                  <option value="">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent cursor-pointer"
                  value={filters.fromDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent cursor-pointer"
                  value={filters.toDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                />
              </div>
              <div className="flex items-start">
                <button 
                  onClick={handleApplyFilters}
                  className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors mt-6"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-lg text-gray-500">Loading orders...</div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {!orders || orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        orders.map((order, index) => (
                          <tr key={order.id} className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                            <td className="px-6 py-4 text-sm text-gray-900">#{order.orderId}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{order.customerName}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">${order.amount.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(order.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <button className="text-gray-600 hover:text-gray-900 transition-colors" title="View">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button className="text-gray-600 hover:text-gray-900 transition-colors" title="Edit">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-gray-600 hover:text-red-600 transition-colors" 
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i;
                      if (pageNum > pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            pageNum === pagination.page
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button 
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add Order Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Order</h2>
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter customer name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, customerName: e.target.value }))}
                  list="customers-list"
                />
                <datalist id="customers-list">
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={newOrder.amount}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={newOrder.status}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Order'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
