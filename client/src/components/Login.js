import React, { useState } from 'react';
import axios from 'axios';
import { Slack, MessageCircle, Clock } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSlackLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/auth/slack');
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-slack-blue rounded-full flex items-center justify-center mb-6">
            <Slack className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Slack Message Viewer
          </h2>
          <p className="text-gray-600 mb-8">
            Access messages older than 90 days from your Slack workspace
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Connect to Slack
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Workspace: <span className="font-semibold text-slack-blue">actdienasty.slack.com</span>
              </p>
            </div>

            <button
              onClick={handleSlackLogin}
              disabled={loading}
              className="w-full slack-button text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Slack className="h-5 w-5" />
              )}
              <span>{loading ? 'Connecting...' : 'Continue with Slack'}</span>
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-400">
                By continuing, you agree to allow this app to access your Slack workspace
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <MessageCircle className="h-8 w-8 text-slack-blue mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">View Messages</h4>
            <p className="text-sm text-gray-500">Access your conversation history</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <Clock className="h-8 w-8 text-slack-yellow mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">90+ Days</h4>
            <p className="text-sm text-gray-500">Go beyond free tier limits</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <Slack className="h-8 w-8 text-slack-green mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Secure Access</h4>
            <p className="text-sm text-gray-500">OAuth 2.0 authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;