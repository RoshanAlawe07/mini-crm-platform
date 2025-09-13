import Link from 'next/link';

export default function Customers() {
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
            <Link href="/customers" className="text-black font-medium">
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-black">Customers</h1>
          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Add Customer
          </button>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Customer List</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">John Doe</h3>
                  <p className="text-sm text-gray-500">john.doe@example.com</p>
                </div>
                <div className="text-sm text-gray-500">
                  Last active: 2 days ago
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Jane Smith</h3>
                  <p className="text-sm text-gray-500">jane.smith@example.com</p>
                </div>
                <div className="text-sm text-gray-500">
                  Last active: 1 week ago
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Bob Johnson</h3>
                  <p className="text-sm text-gray-500">bob.johnson@example.com</p>
                </div>
                <div className="text-sm text-gray-500">
                  Last active: 3 days ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
