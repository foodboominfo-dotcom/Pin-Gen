
import React, { useState, useEffect } from 'react';
import { GitHubConfig } from '../types';
import { verifyConnection } from '../services/githubService';
import { saveGitHubConfig, loadGitHubConfig } from '../services/storageService';

interface GitHubAuthFormProps {
  onConnect: (config: GitHubConfig) => void;
}

const GitHubAuthForm: React.FC<GitHubAuthFormProps> = ({ onConnect }) => {
  const [config, setConfig] = useState<GitHubConfig>({
    username: '',
    repo: '',
    token: ''
  });
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle');

  // Load saved credentials on mount
  useEffect(() => {
    const savedConfig = loadGitHubConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('checking');
    
    const isValid = await verifyConnection(config);
    
    if (isValid) {
      saveGitHubConfig(config); // Persist to local database
      onConnect(config);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 text-white">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
        <div className="bg-gray-800 p-8 text-center border-b border-gray-700">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white font-serif">Connect GitHub</h2>
          <p className="text-gray-400 text-sm mt-2">Enter your repository details to start.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {status === 'error' && (
            <div className="bg-red-900/30 text-red-400 p-4 rounded-lg text-sm text-center border border-red-900/50">
              <strong>Connection Failed.</strong><br/>Check your token and permissions.
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1">GitHub Username</label>
            <input 
              type="text" 
              required
              value={config.username}
              onChange={e => setConfig({...config, username: e.target.value})}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-600"
              placeholder="e.g., johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1">Repository Name</label>
            <input 
              type="text" 
              required
              value={config.repo}
              onChange={e => setConfig({...config, repo: e.target.value})}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-600"
              placeholder="e.g., pinterest-images"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1">Personal Access Token</label>
            <input 
              type="password" 
              required
              value={config.token}
              onChange={e => setConfig({...config, token: e.target.value})}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-600"
              placeholder="ghp_..."
            />
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline mt-2 block"
            >
              Get a Token (Select 'repo' scope)
            </a>
          </div>

          <button 
            type="submit"
            disabled={status === 'checking'}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all 
              ${status === 'checking' ? 'bg-gray-700 text-gray-400' : 'bg-red-600 hover:bg-red-700 shadow-lg hover:-translate-y-0.5'}`}
          >
            {status === 'checking' ? 'Verifying...' : 'Connect & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GitHubAuthForm;
