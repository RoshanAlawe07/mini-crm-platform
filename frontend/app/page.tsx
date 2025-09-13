import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-12 py-4 border-b border-gray-200">
        {/* Left side - Brand and Navigation */}
        <div className="flex items-center space-x-8" style={{marginLeft: '70px'}}>
          <h1 className="text-2xl font-bold text-black">FlowCRM®</h1>
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
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          {/* Welcome Message */}
          <h2 className="text-5xl font-extrabold text-black -mb-2 font-inter leading-tight">
            Welcome to FlowCRM.
          </h2>
          <p className="text-5xl text-gray-500 mb-6 font-inter leading-tight font-bold">
            Sign in to your workspace.
          </p>
          
          {/* Google Login Button */}
          <button className="bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors text-sm font-medium mt-2.5">
            Login with Google
          </button>
        </div>
      </main>

      {/* Additional Section */}
      <section className="py-16 px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text Content */}
            <div className="space-y-6" style={{marginLeft: '100px'}}>
              <h3 className="text-3xl font-bold text-black">
                Easy login
              </h3>
              <p className="text-xl text-gray-600 font-medium">
                Sign in securely using<br />
                Google OAuth 2.0 – no<br />
                passwords required.
              </p>
            </div>
            
            {/* Right side - UI Element */}
            <div className="flex justify-center">
              <div className="w-[600px] h-[500px] bg-gray-200 rounded-2xl shadow-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Control Section */}
      <section className="py-16 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center">
            {/* Left side - UI Element */}
            <div className="flex justify-center" style={{marginTop: '-100px', marginLeft: '50px'}}>
              <div className="bg-gray-200 rounded-2xl shadow-lg" style={{width: '550px', height: '500px'}}></div>
            </div>
            
            {/* Right side - Text Content */}
            <div className="space-y-6 text-left" style={{marginLeft: '150px', width: '400px'}}>
              <h3 className="text-3xl font-extrabold text-black">
                Access control
              </h3>
              <p className="text-xl text-gray-600 font-medium leading-tight">
                CRM features are available<br />
                for authenticated users only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Support Section */}
      <section className="py-16 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center">
            {/* Left side - Text Content */}
            <div className="space-y-6" style={{width: '400px', marginLeft: '150px'}}>
              <h3 className="text-3xl font-bold text-black">
                Quick support
              </h3>
              <p className="text-xl text-gray-600 font-medium">
                Reach out to our support team<br />
                right from the dashboard.
              </p>
            </div>
            
            {/* Right side - UI Element */}
            <div className="flex justify-center" style={{marginTop: '-100px', marginLeft: '260px'}}>
              <div className="w-[570px] h-[500px] bg-gray-200 rounded-2xl shadow-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-16 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-6" style={{marginTop: '50px'}}>
            {/* Card 1 - Summary */}
            <div className="w-96 h-[30rem] bg-gray-200 rounded-2xl shadow-lg flex flex-col items-center justify-end py-8">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 font-normal">Summary</p>
                <p className="text-xl font-bold text-black">Customers</p>
              </div>
            </div>

            {/* Card 2 - Insights */}
            <div className="w-96 h-[30rem] bg-gray-200 rounded-2xl shadow-lg flex flex-col items-center justify-end py-8">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 font-normal">Insights</p>
                <p className="text-xl font-bold text-black">Orders</p>
              </div>
            </div>

            {/* Card 3 - Automation */}
            <div className="w-96 h-[30rem] bg-gray-200 rounded-2xl shadow-lg flex flex-col items-center justify-end py-8">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 font-normal">Automation</p>
                <p className="text-xl font-bold text-black">Campaigns</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Simplify Section */}
      <section className="py-20 px-12" style={{marginTop: '200px'}}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Ready to simplify your customer management?
          </h2>
          <p className="text-2xl text-gray-500 mb-8 leading-snug font-medium">
            Experience the new era of<br />
            CRM, powered by AI-driven<br />
            segmentation and<br />
            communication.
          </p>
          <button className="bg-black text-white px-8 py-1 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors">
            Start Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-12 bg-white" style={{marginTop: '200px'}}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            {/* Left side - Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-b-[28px] border-l-transparent border-r-transparent border-b-gray-300"></div>
            </div>
            
            {/* Right side - Navigation Columns */}
            <div className="flex space-x-16">
              {/* Platform Column */}
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-black">Platform</h4>
                <div className="space-y-2">
                  <p className="text-base text-gray-500">Dashboard</p>
                  <p className="text-base text-gray-500">Customers</p>
                  <p className="text-base text-gray-500">Campaigns</p>
                </div>
              </div>

              {/* Features Column */}
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-black">Features</h4>
                <div className="space-y-2">
                  <p className="text-base text-gray-500">Segmentation</p>
                  <p className="text-base text-gray-500">Orders</p>
                  <p className="text-base text-gray-500">AI Tools</p>
                </div>
              </div>

              {/* Support Column */}
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-black">Support</h4>
                <div className="space-y-2">
                  <p className="text-base text-gray-500">FAQs</p>
                  <p className="text-base text-gray-500">Contact</p>
                  <p className="text-base text-gray-500">Docs</p>
                </div>
              </div>

              {/* Company Column */}
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-black">Company</h4>
                <div className="space-y-2">
                  <p className="text-base text-gray-500">Terms</p>
                  <p className="text-base text-gray-500">Privacy</p>
                  <p className="text-base text-gray-500">Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
