import Link from 'next/link';

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
          <Link 
            href="/segments"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Segments
          </Link>
          <button className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
            Learn More
          </button>
        </div>
        <div className="mt-8 p-6 bg-blue-50 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Rules Format Example</h2>
          <p className="text-blue-800 mb-3">
            Create customer segments using flexible JSON rules. Here's an example:
          </p>
          <pre className="text-sm text-blue-700 bg-white p-3 rounded border text-left overflow-x-auto">
{`{
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
}`}
          </pre>
          <p className="text-sm text-blue-700 mt-2">
            This selects customers who either: spent more than 10,000 AND visited less than 3 times, 
            OR have last_active date before Jan 2025.
          </p>
        </div>
      </div>
    </main>
  )
}
