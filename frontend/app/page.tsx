'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
    setIsLoading(false);
    
    if (authStatus !== 'true') {
      router.push('/signup');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Redirecting to Sign Up...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-12 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-8" style={{marginLeft: '70px'}}>
        <Link href="/" className="text-2xl font-bold text-black">XenoCRM</Link>
       <nav className="flex space-x-6">
         <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-gray-100">
           Dashboard
         </Link>
         <Link href="/customers" className="text-gray-500 hover:text-blue-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-blue-100">
           Customers
         </Link>
         <Link href="/orders" className="text-gray-500 hover:text-green-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-green-100">
           Orders
         </Link>
         <Link href="/campaigns" className="text-gray-500 hover:text-purple-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-purple-100">
           Campaigns
         </Link>
         <Link href="/segments" className="text-gray-500 hover:text-orange-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-orange-100">
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

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-black -mb-2 font-inter leading-tight">
            Welcome to XenoCRM.
          </h2>
          <p className="text-5xl text-gray-500 mb-6 font-inter leading-tight font-bold">
            Sign in to your workspace.
          </p>
          
          <button className="bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors text-sm font-medium mt-2.5">
           XenoCRM
          </button>
        </div>
      </main>

      <section className="py-16 px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
            
            <div className="flex justify-center">
              <div className="w-[600px] h-[500px] bg-gray-200 rounded-2xl shadow-lg"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center">
            <div className="flex justify-center" style={{marginTop: '-100px', marginLeft: '50px'}}>
              <div className="bg-gray-200 rounded-2xl shadow-lg" style={{width: '550px', height: '500px'}}></div>
            </div>
            
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

      <section className="py-16 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center">
            <div className="space-y-6" style={{width: '400px', marginLeft: '150px'}}>
              <h3 className="text-3xl font-bold text-black">
                Quick support
              </h3>
              <p className="text-xl text-gray-600 font-medium">
                Reach out to our support team<br />
                right from the dashboard.
              </p>
            </div>
            
            <div className="flex justify-center" style={{marginTop: '-100px', marginLeft: '260px'}}>
              <div className="w-[570px] h-[500px] bg-gray-200 rounded-2xl shadow-lg"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-6" style={{marginTop: '50px'}}>
            <Link href="/customers" className="w-96 h-[30rem] bg-gray-200 rounded-2xl shadow-lg flex flex-col items-center justify-end py-8 transition-all duration-300 hover:bg-blue-100 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 cursor-pointer group">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 font-normal group-hover:text-blue-600 transition-colors duration-300">Summary</p>
                <p className="text-xl font-bold text-black group-hover:text-blue-800 transition-colors duration-300">Customers</p>
              </div>
            </Link>

            <Link href="/orders" className="w-96 h-[30rem] bg-gray-200 rounded-2xl shadow-lg flex flex-col items-center justify-end py-8 transition-all duration-300 hover:bg-green-100 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 cursor-pointer group">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 font-normal group-hover:text-green-600 transition-colors duration-300">Insights</p>
                <p className="text-xl font-bold text-black group-hover:text-green-800 transition-colors duration-300">Orders</p>
              </div>
            </Link>

            <Link href="/campaigns" className="w-96 h-[30rem] bg-gray-200 rounded-2xl shadow-lg flex flex-col items-center justify-end py-8 transition-all duration-300 hover:bg-purple-100 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 cursor-pointer group">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 font-normal group-hover:text-purple-600 transition-colors duration-300">Automation</p>
                <p className="text-xl font-bold text-black group-hover:text-purple-800 transition-colors duration-300">Campaigns</p>
              </div>
            </Link>

            <Link href="/segments" className="w-96 h-[30rem] bg-gray-200 rounded-2xl shadow-lg flex flex-col items-center justify-end py-8 transition-all duration-300 hover:bg-orange-100 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 cursor-pointer group">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500 font-normal group-hover:text-orange-600 transition-colors duration-300">Segmentation</p>
                <p className="text-xl font-bold text-black group-hover:text-orange-800 transition-colors duration-300">Segments</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

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

      <footer className="py-16 px-12 bg-white" style={{marginTop: '200px'}}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-b-[28px] border-l-transparent border-r-transparent border-b-gray-300"></div>
            </div>
            
            <div className="flex space-x-16">
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-black">Platform</h4>
                <div className="space-y-2">
                  <p className="text-base text-gray-500">Dashboard</p>
                  <p className="text-base text-gray-500">Customers</p>
                  <p className="text-base text-gray-500">Campaigns</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg font-bold text-black">Features</h4>
                <div className="space-y-2">
                  <p className="text-base text-gray-500">Segmentation</p>
                  <p className="text-base text-gray-500">Orders</p>
                  <p className="text-base text-gray-500">AI Tools</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg font-bold text-black">Support</h4>
                <div className="space-y-2">
                  <p className="text-base text-gray-500">FAQs</p>
                  <p className="text-base text-gray-500">Contact</p>
                  <p className="text-base text-gray-500">Docs</p>
                </div>
              </div>

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