'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    activeCampaigns: 0,
    totalIncome: 0,
    totalSegments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';
      
      const customersResponse = await fetch(`${apiUrl}/api/customers`);
      const customersData = await customersResponse.json();
      const totalCustomers = customersData.customers ? customersData.customers.length : 0;

      const campaignsResponse = await fetch(`${apiUrl}/api/campaigns`);
      const campaignsData = await campaignsResponse.json();
      const activeCampaigns = campaignsData.success 
        ? campaignsData.data.filter((campaign: any) => campaign.status === 'ACTIVE' || campaign.status === 'SCHEDULED').length 
        : 0;

      const ordersResponse = await fetch(`${apiUrl}/api/orders`);
      const ordersData = await ordersResponse.json();
      const totalIncome = ordersData.orders 
        ? ordersData.orders.reduce((sum: number, order: any) => sum + (order.amount || 0), 0)
        : 0;

      const segmentsResponse = await fetch(`${apiUrl}/api/segments`);
      const segmentsData = await segmentsResponse.json();
      const totalSegments = segmentsData.success && segmentsData.data ? segmentsData.data.length : 0;

      setDashboardData({
        totalCustomers,
        activeCampaigns,
        totalIncome,
        totalSegments
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="relative">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-black">XenoCRM</Link>
            <nav className="hidden md:flex space-x-2 lg:space-x-6">
              <Link href="/dashboard" className="text-black font-medium text-sm lg:text-base">
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
              <Link href="/segments" className="text-gray-500 hover:text-gray-700 transition-colors text-sm lg:text-base">
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
              onClick={handleSignOut}
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
                className="text-black font-medium px-3 py-2 rounded-lg bg-gray-100 text-sm"
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
                className="text-gray-500 hover:text-orange-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-orange-100 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Segments
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="px-6 py-8">
        <h1 className="text-3xl font-bold text-black mb-6">Dashboard</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Customers</h3>
                <p className="text-3xl font-bold text-black">{dashboardData.totalCustomers.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Campaigns</h3>
                <p className="text-3xl font-bold text-black">{dashboardData.activeCampaigns}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Income</h3>
                <p className="text-3xl font-bold text-black">${dashboardData.totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Segments</h3>
                <p className="text-3xl font-bold text-black">{dashboardData.totalSegments}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">CRM Overview Dashboard</h3>
              
              <div className="h-80 flex items-end justify-center space-x-6">
                <div className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 w-16 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
                    style={{
                      height: `${Math.max(40, (dashboardData.totalCustomers / Math.max(Math.max(Math.max(dashboardData.totalCustomers, dashboardData.activeCampaigns), dashboardData.totalSegments), dashboardData.totalIncome / 1000)) * 250)}px`
                    }}
                  ></div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{dashboardData.totalCustomers}</div>
                    <div className="text-sm text-gray-600">Customers</div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div 
                    className="bg-green-500 w-16 rounded-t-lg transition-all duration-500 hover:bg-green-600"
                    style={{
                      height: `${Math.max(40, (dashboardData.activeCampaigns / Math.max(Math.max(Math.max(dashboardData.totalCustomers, dashboardData.activeCampaigns), dashboardData.totalSegments), dashboardData.totalIncome / 1000)) * 250)}px`
                    }}
                  ></div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.activeCampaigns}</div>
                    <div className="text-sm text-gray-600">Campaigns</div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div 
                    className="bg-orange-500 w-16 rounded-t-lg transition-all duration-500 hover:bg-orange-600"
                    style={{
                      height: `${Math.max(40, (dashboardData.totalSegments / Math.max(Math.max(Math.max(dashboardData.totalCustomers, dashboardData.activeCampaigns), dashboardData.totalSegments), dashboardData.totalIncome / 1000)) * 250)}px`
                    }}
                  ></div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{dashboardData.totalSegments}</div>
                    <div className="text-sm text-gray-600">Segments</div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div 
                    className="bg-purple-500 w-16 rounded-t-lg transition-all duration-500 hover:bg-purple-600"
                    style={{
                      height: `${Math.max(40, ((dashboardData.totalIncome / 1000) / Math.max(Math.max(Math.max(dashboardData.totalCustomers, dashboardData.activeCampaigns), dashboardData.totalSegments), dashboardData.totalIncome / 1000)) * 250)}px`
                    }}
                  ></div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">${(dashboardData.totalIncome / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-gray-600">Income</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-medium text-gray-900">Total Customers</div>
                  <div className="text-xs text-gray-600">Registered users in system</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-medium text-gray-900">Active Campaigns</div>
                  <div className="text-xs text-gray-600">Currently running campaigns</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-medium text-gray-900">Total Segments</div>
                  <div className="text-xs text-gray-600">Customer segmentation groups</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-4 h-4 bg-purple-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-medium text-gray-900">Total Income</div>
                  <div className="text-xs text-gray-600">Revenue from all orders</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{dashboardData.totalCustomers}</div>
                    <div className="text-sm text-gray-500">Total Customers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">{dashboardData.activeCampaigns}</div>
                    <div className="text-sm text-gray-500">Active Campaigns</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600">{dashboardData.totalSegments}</div>
                    <div className="text-sm text-gray-500">Total Segments</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">${dashboardData.totalIncome.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total Income</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
