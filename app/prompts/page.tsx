import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prompts',
  description: 'Manage and organize your prompts',
}

export default function PromptsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Prompts</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder prompt cards */}
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Prompt Title {i}</h2>
            <p className="text-gray-600 mb-4">
              This is a placeholder description for prompt {i}. 
              The actual content will be loaded from the database.
            </p>
            <div className="flex justify-end">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
