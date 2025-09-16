'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isAuthenticated, signInWithGoogle } from '../lib/oauth';
import config from '../config';

export default function Home() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const authStatus = await isAuthenticated();
        setIsAuth(authStatus);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuth(false);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="relative">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-black">XenoCRM</Link>
            <nav className="hidden md:flex space-x-2 lg:space-x-6">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors duration-300 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-100 text-sm lg:text-base">
                Dashboard
              </Link>
              <Link href="/customers" className="text-gray-500 hover:text-blue-600 transition-colors duration-300 px-2 lg:px-3 py-2 rounded-lg hover:bg-blue-100 text-sm lg:text-base">
                Customers
              </Link>
              <Link href="/orders" className="text-gray-500 hover:text-green-600 transition-colors duration-300 px-2 lg:px-3 py-2 rounded-lg hover:bg-green-100 text-sm lg:text-base">
                Orders
              </Link>
              <Link href="/campaigns" className="text-gray-500 hover:text-purple-600 transition-colors duration-300 px-2 lg:px-3 py-2 rounded-lg hover:bg-purple-100 text-sm lg:text-base">
                Campaigns
              </Link>
              <Link href="/segments" className="text-gray-500 hover:text-orange-600 transition-colors duration-300 px-2 lg:px-3 py-2 rounded-lg hover:bg-orange-100 text-sm lg:text-base">
                Segments
              </Link>
              <Link href={`${config.API_BASE_URL}/api-docs`} target="_blank" className="text-gray-500 hover:text-indigo-600 transition-colors duration-300 px-2 lg:px-3 py-2 rounded-lg hover:bg-indigo-100 text-sm lg:text-base">
                API Docs
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
            
            {isAuth ? (
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setIsAuth(false);
                  router.push('/');
                }}
                className="bg-black text-white px-2 sm:px-3 py-1.5 rounded-2xl hover:bg-gray-800 transition-colors text-xs sm:text-sm" 
              >
                Sign Out
              </button>
            ) : (
              <Link 
                href="/signin"
                className="bg-black text-white px-2 sm:px-3 py-1.5 rounded-2xl hover:bg-gray-800 transition-colors text-xs sm:text-sm" 
              >
                Sign In
              </Link>
            )}
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
                className="text-gray-500 hover:text-orange-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-orange-100 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Segments
              </Link>
              <Link 
                href={`${config.API_BASE_URL}/api-docs`} 
                target="_blank"
                className="text-gray-500 hover:text-indigo-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-indigo-100 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                API Docs
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-12">
        <div className="text-center max-w-4xl mx-auto">
          {isAuth ? (
            // Authenticated user content - simple dashboard access
            <>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black -mb-2 font-inter leading-tight">
                Welcome to XenoCRM.
              </h2>
              <p className="text-2xl sm:text-3xl lg:text-5xl text-gray-500 mb-6 font-inter leading-tight font-bold">
                Your workspace is ready.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link 
                  href="/dashboard" 
                  className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Continue to Dashboard
                </Link>
                <Link 
                  href={`${config.API_BASE_URL}/api-docs`}
                  target="_blank"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  🧪 API Testing
                </Link>
              </div>
            </>
          ) : (
            // Non-authenticated user content - simple Google sign in
            <>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black -mb-2 font-inter leading-tight">
                Welcome to XenoCRM.
              </h2>
              <p className="text-2xl sm:text-3xl lg:text-5xl text-gray-500 mb-6 font-inter leading-tight font-bold">
                Sign in to continue.
              </p>
              
              <button
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (error) {
                    console.error('Google sign in error:', error);
                  }
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors text-sm font-medium mt-2.5 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Sign In
              </button>
            </>
          )}
        </div>
      </main>

      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 lg:space-y-6 text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-black">
                Easy login
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 font-medium">
                Sign in securely using<br />
                Google OAuth 2.0 – no<br />
                passwords required.
              </p>
            </div>
            
            <div className="flex justify-center">
              <img 
                src="/Login.jpg" 
                alt="Login illustration" 
                className="w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[600px] h-[300px] sm:h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-start gap-8 lg:gap-12">
            <div className="flex justify-center order-2 lg:order-1 flex-shrink-0">
              <img 
                src="/Access.webp" 
                alt="Access control illustration" 
                className="w-[400px] sm:w-[500px] lg:w-[600px] h-[300px] sm:h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-lg"
              />
            </div>
            
            <div className="space-y-4 lg:space-y-6 text-center lg:text-right order-1 lg:order-2 max-w-lg lg:ml-[250px]">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-black">
                Access control
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 font-medium leading-tight">
                CRM features are available<br />
                for authenticated users only.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            <div className="space-y-4 lg:space-y-6 text-center lg:text-left order-1 max-w-lg">
              <h3 className="text-2xl sm:text-3xl font-bold text-black">
                Quick support
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 font-medium">
                Reach out to our support team<br />
                right from the dashboard.
              </p>
            </div>
            
            <div className="flex justify-center order-2 flex-shrink-0">
              <img 
                src="/support.jpg" 
                alt="Support illustration" 
                className="w-[400px] sm:w-[500px] lg:w-[570px] h-[300px] sm:h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/customers" className="w-full h-[20rem] sm:h-[25rem] lg:h-[30rem] rounded-2xl shadow-lg flex flex-col items-center justify-end py-6 sm:py-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden">
              <img src="/Customers.jpg" alt="Customers" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
              <div className="text-center space-y-2 relative z-10 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-xs sm:text-sm text-gray-500 font-normal group-hover:text-blue-600 transition-colors duration-300">Summary</p>
                <p className="text-lg sm:text-xl font-bold text-black group-hover:text-blue-800 transition-colors duration-300">Customers</p>
              </div>
            </Link>

            <Link href="/orders" className="w-full h-[20rem] sm:h-[25rem] lg:h-[30rem] rounded-2xl shadow-lg flex flex-col items-center justify-end py-6 sm:py-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden">
              <img src="/orders.jpg" alt="Orders" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
              <div className="text-center space-y-2 relative z-10 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-xs sm:text-sm text-gray-500 font-normal group-hover:text-green-600 transition-colors duration-300">Insights</p>
                <p className="text-lg sm:text-xl font-bold text-black group-hover:text-green-800 transition-colors duration-300">Orders</p>
              </div>
            </Link>

            <Link href="/campaigns" className="w-full h-[20rem] sm:h-[25rem] lg:h-[30rem] rounded-2xl shadow-lg flex flex-col items-center justify-end py-6 sm:py-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden">
              <img src="/campaigns.jpg" alt="Campaigns" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
              <div className="text-center space-y-2 relative z-10 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-xs sm:text-sm text-gray-500 font-normal group-hover:text-purple-600 transition-colors duration-300">Automation</p>
                <p className="text-lg sm:text-xl font-bold text-black group-hover:text-purple-800 transition-colors duration-300">Campaigns</p>
              </div>
            </Link>

            <Link href="/segments" className="w-full h-[20rem] sm:h-[25rem] lg:h-[30rem] rounded-2xl shadow-lg flex flex-col items-center justify-end py-6 sm:py-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden">
              <img src="/segment.jpg" alt="Segments" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
              <div className="text-center space-y-2 relative z-10 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-xs sm:text-sm text-gray-500 font-normal group-hover:text-orange-600 transition-colors duration-300">Segmentation</p>
                <p className="text-lg sm:text-xl font-bold text-black group-hover:text-orange-800 transition-colors duration-300">Segments</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 mt-8 sm:mt-16 lg:mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-6">
            Ready to simplify your customer management?
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-500 mb-6 sm:mb-8 leading-snug font-medium">
            Experience the new era of<br />
            CRM, powered by AI-driven<br />
            segmentation and<br />
            communication.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-black text-white px-6 sm:px-8 py-2 sm:py-1 rounded-full text-base sm:text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Start Now
          </button>
        </div>
      </section>

      <footer className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-12 bg-white mt-8 sm:mt-16 lg:mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded"></div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full"></div>
              <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] border-r-[12px] sm:border-r-[16px] border-b-[20px] sm:border-b-[28px] border-l-transparent border-r-transparent border-b-gray-300"></div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-16 w-full lg:w-auto">
              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-bold text-black">Platform</h4>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-gray-500">Dashboard</p>
                  <p className="text-sm sm:text-base text-gray-500">Customers</p>
                  <p className="text-sm sm:text-base text-gray-500">Campaigns</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-bold text-black">Features</h4>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-gray-500">Segmentation</p>
                  <p className="text-sm sm:text-base text-gray-500">Orders</p>
                  <p className="text-sm sm:text-base text-gray-500">AI Tools</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-bold text-black">Support</h4>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-gray-500">FAQs</p>
                  <p className="text-sm sm:text-base text-gray-500">Contact</p>
                  <p className="text-sm sm:text-base text-gray-500">Docs</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-bold text-black">Company</h4>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-gray-500">Terms</p>
                  <p className="text-sm sm:text-base text-gray-500">Privacy</p>
                  <p className="text-sm sm:text-base text-gray-500">Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}