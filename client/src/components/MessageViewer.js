import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Clock, User, Loader2, ChevronUp, ChevronDown, Hash, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MessageViewer = ({ channel, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [oldestTimestamp, setOldestTimestamp] = useState(null);
  const [error, setError] = useState(null);
  const [userCache, setUserCache] = useState({});

  useEffect(() => {
    fetchMessages();
  }, [channel.id]);

  const fetchMessages = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = {
        limit: 100,
        ...(loadMore && oldestTimestamp && { oldest: oldestTimestamp })
      };

      const response = await axios.get(`/api/messages/${channel.id}`, { params });
      
      if (loadMore) {
        setMessages(prev => [...prev, ...response.data.messages]);
      } else {
        setMessages(response.data.messages);
      }

      setHasMore(response.data.has_more);
      setOldestTimestamp(response.data.oldest_ts);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loadingMore) {
      fetchMessages(true);
    }
  };

  const getUserInfo = async (userId) => {
    if (userCache[userId]) {
      return userCache[userId];
    }

    try {
      const response = await axios.get(`/api/user/${userId}`);
      const user = response.data.user;
      setUserCache(prev => ({ ...prev, [userId]: user }));
      return user;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return { name: 'Unknown User', real_name: 'Unknown User' };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getChannelIcon = () => {
    if (channel.is_im) return <User className="h-4 w-4" />;
    if (channel.is_mpim) return <User className="h-4 w-4" />;
    if (channel.is_private) return <Lock className="h-4 w-4" />;
    return <Hash className="h-4 w-4" />;
  };

  const getChannelType = () => {
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
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-gray-500">
                {getChannelIcon()}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  #{channel.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {getChannelType()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Messages Older Than 90 Days
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{messages.length} messages found</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {messages.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No messages older than 90 days found in this channel.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageCard
                  key={`${message.ts}-${index}`}
                  message={message}
                  getUserInfo={getUserInfo}
                  formatTimestamp={formatTimestamp}
                />
              ))
            )}
          </div>

          {hasMore && (
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={loadMoreMessages}
                disabled={loadingMore}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span>{loadingMore ? 'Loading...' : 'Load More Messages'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Message History
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  These messages are older than 90 days and would not be accessible 
                  through Slack's free tier. The app fetches them using Slack's 
                  official API with your authenticated access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const MessageCard = ({ message, getUserInfo, formatTimestamp }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (message.user) {
      getUserInfo(message.user).then(user => {
        setUserInfo(user);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [message.user, getUserInfo]);

  return (
    <div className="px-6 py-4 hover:bg-gray-50 message-card">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
            {loading ? (
              <div className="animate-pulse h-4 w-4 bg-gray-400 rounded"></div>
            ) : (
              <span className="text-sm font-medium text-gray-700">
                {userInfo?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {loading ? 'Loading...' : (userInfo?.real_name || userInfo?.name || 'Unknown User')}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimestamp(message.ts)}
            </span>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {message.text}
          </div>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                📎 {message.attachments.length} attachment(s)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageViewer;