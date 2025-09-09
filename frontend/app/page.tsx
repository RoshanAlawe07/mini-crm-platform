export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Mini CRM Platform
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          A modern CRM solution built with React.js and Node.js
        </p>
        <div className="space-x-4">
          <button className="btn-primary">
            Get Started
          </button>
          <button className="btn-secondary">
            Learn More
          </button>
        </div>
      </div>
    </main>
  )
}
