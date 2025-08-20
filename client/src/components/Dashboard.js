import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Search, MessageCircle, Hash, Lock, User, Users } from 'lucide-react';
import MessageViewer from './MessageViewer';

const Dashboard = ({ user, onLogout }) => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/channels');
      setChannels(response.data.channels);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      setError('Failed to load channels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChannelIcon = (channel) => {
    if (channel.is_im) return <User className="h-4 w-4" />;
    if (channel.is_mpim) return <Users className="h-4 w-4" />;
    if (channel.is_private) return <Lock className="h-4 w-4" />;
    return <Hash className="h-4 w-4" />;
  };

  const getChannelType = (channel) => {
    if (channel.is_im) return 'Direct Message';
    if (channel.is_mpim) return 'Group DM';
    if (channel.is_private) return 'Private Channel';
    return 'Public Channel';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slack-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (selectedChannel) {
    return (
      <MessageViewer
        channel={selectedChannel}
        onBack={() => setSelectedChannel(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-slack-blue rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Slack Message Viewer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Workspace: actdienasty.slack.com
              </span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Select a Channel to View Old Messages
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slack-blue focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {filteredChannels.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'No channels found matching your search.' : 'No channels available.'}
                </p>
              </div>
            ) : (
              filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer channel-item"
                  onClick={() => setSelectedChannel(channel)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-500">
                        {getChannelIcon(channel)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {channel.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {getChannelType(channel)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        Click to view messages
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                About Message Access
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This app allows you to view Slack messages that are older than 90 days, 
                  which are not accessible through the free Slack subscription. Messages are 
                  fetched using Slack's official API with proper authentication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;