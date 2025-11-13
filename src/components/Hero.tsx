import { Search } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    onSearch(query);
  };

  return (
    <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Dream Home in Malawi
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-emerald-50">
            Discover the perfect property for sale or rent
          </p>

          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg p-2 shadow-xl">
              <input
                type="text"
                name="search"
                placeholder="Search by location, property type..."
                className="flex-1 px-4 py-3 text-gray-900 outline-none rounded"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
