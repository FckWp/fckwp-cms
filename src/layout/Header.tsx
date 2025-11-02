import { useState } from "react";
import { Menu, X, Search, User, Bell, Grid3X3 } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                Twenty
              </h1>
            </div>
            <nav className="hidden md:flex md:space-x-1">
              <a
                href="#"
                className="text-gray-900 bg-gray-50 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              >
                Companies
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              >
                People
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              >
                Opportunities
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              >
                Tasks
              </a>
            </nav>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="⌘K to search..."
                className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:bg-white focus:border-gray-300 focus:ring-0 outline-none transition-all"
              />
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center h-16 px-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                    Twenty
                  </h1>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="⌘K to search..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder-gray-500 focus:bg-white focus:border-gray-300 focus:ring-0 outline-none transition-all"
                    />
                  </div>

                  <nav className="space-y-2">
                    <a
                      href="#"
                      className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 text-base font-medium rounded-lg transition-colors"
                    >
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-4"></span>
                      Dashboard
                    </a>
                    <a
                      href="#"
                      className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-4 py-3 text-base font-medium rounded-lg transition-colors"
                    >
                      <span className="w-2 h-2 bg-transparent rounded-full mr-4"></span>
                      Companies
                    </a>
                    <a
                      href="#"
                      className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-4 py-3 text-base font-medium rounded-lg transition-colors"
                    >
                      <span className="w-2 h-2 bg-transparent rounded-full mr-4"></span>
                      People
                    </a>
                    <a
                      href="#"
                      className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-4 py-3 text-base font-medium rounded-lg transition-colors"
                    >
                      <span className="w-2 h-2 bg-transparent rounded-full mr-4"></span>
                      Opportunities
                    </a>
                    <a
                      href="#"
                      className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-4 py-3 text-base font-medium rounded-lg transition-colors"
                    >
                      <span className="w-2 h-2 bg-transparent rounded-full mr-4"></span>
                      Tasks
                    </a>
                    <a
                      href="#"
                      className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-4 py-3 text-base font-medium rounded-lg transition-colors"
                    >
                      <span className="w-2 h-2 bg-transparent rounded-full mr-4"></span>
                      Settings
                    </a>
                  </nav>
                </div>
              </div>

              <div className="border-t border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        John Doe
                      </div>
                      <div className="text-xs text-gray-500">
                        john@company.com
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                      <Grid3X3 className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                      <Bell className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
