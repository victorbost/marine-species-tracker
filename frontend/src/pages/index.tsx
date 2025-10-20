import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Marine Species Observation Tracker</title>
        <meta name="description" content="Track and explore marine species observations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold text-center text-blue-900 mb-4">
            🌊 Marine Species Observation Tracker
          </h1>
          <p className="text-xl text-center text-blue-700 mb-8">
            Empower divers, biologists, and hobbyists to log and explore marine species observations
          </p>
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Your MVP!</h2>
            <p className="text-gray-700 mb-4">
              Your monorepo is set up and ready. Next steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Set up your backend: <code className="bg-gray-100 px-2 py-1 rounded">cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt</code></li>
              <li>Run migrations: <code className="bg-gray-100 px-2 py-1 rounded">python manage.py migrate</code></li>
              <li>Install frontend dependencies: <code className="bg-gray-100 px-2 py-1 rounded">cd frontend && npm install</code></li>
              <li>Start developing your map component and observation features!</li>
            </ol>
          </div>
        </div>
      </main>
    </>
  )
}
