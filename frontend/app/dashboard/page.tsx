import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-12 py-4 border-b border-gray-200">
        {/* Left side - Brand and Navigation */}
        <div className="flex items-center space-x-8" style={{marginLeft: '70px'}}>
          <Link href="/" className="text-2xl font-bold text-black">FlowCRM®</Link>
          <nav className="flex space-x-6">
            <Link href="/dashboard" className="text-black font-medium">
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
        <h1 className="text-3xl font-bold text-black mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Customers</h3>
            <p className="text-3xl font-bold text-black">1,234</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Campaigns</h3>
            <p className="text-3xl font-bold text-black">12</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages Sent</h3>
            <p className="text-3xl font-bold text-black">5,678</p>
          </div>
        </div>
      </main>
    </div>
  )
}
