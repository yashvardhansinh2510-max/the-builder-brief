import { useState } from "react";
import { Button } from "../components/ui/button";
import { Copy, Eye, EyeOff, Trash2 } from "lucide-react";

export default function DeveloperPortal() {
  const [apiKeys, setApiKeys] = useState([
    {
      id: "key_1",
      name: "Production",
      key: "sk_live_abc123def456...",
      visible: false,
      createdAt: "2024-01-15",
      lastUsed: "2024-04-20",
    },
  ]);

  const [copiedKey, setCopiedKey] = useState("");

  const toggleKeyVisibility = (id: string) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, visible: !k.visible } : k));
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Developer Portal</h1>
        <p className="text-slate-400 mb-12">Build with the Specflow API</p>

        {/* Documentation Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <a href="#docs" className="bg-slate-900 rounded-lg p-6 border border-slate-800 hover:border-blue-600 transition group">
            <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition">Documentation</h3>
            <p className="text-slate-400 text-sm">REST API reference and guides</p>
          </a>
          <a href="#webhooks" className="bg-slate-900 rounded-lg p-6 border border-slate-800 hover:border-blue-600 transition group">
            <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition">Webhooks</h3>
            <p className="text-slate-400 text-sm">Real-time event notifications</p>
          </a>
          <a href="#status" className="bg-slate-900 rounded-lg p-6 border border-slate-800 hover:border-blue-600 transition group">
            <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition">API Status</h3>
            <p className="text-slate-400 text-sm">99.99% uptime SLA</p>
          </a>
        </div>

        {/* API Keys Section */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">API Keys</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">Create New Key</Button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-semibold">{apiKey.name}</p>
                  <Button
                    className="bg-red-900 hover:bg-red-800 text-xs"
                    size="sm"
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                </div>

                <div className="bg-slate-900 rounded p-3 mb-3 flex items-center justify-between">
                  <code className="text-slate-300 font-mono text-sm">
                    {apiKey.visible ? apiKey.key : apiKey.key.replace(/./g, "•")}
                  </code>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-2 hover:bg-slate-800 rounded transition"
                    >
                      {apiKey.visible ? <EyeOff size={16} className="text-slate-400" /> : <Eye size={16} className="text-slate-400" />}
                    </button>
                    <button
                      onClick={() => copyKey(apiKey.key)}
                      className="p-2 hover:bg-slate-800 rounded transition"
                    >
                      <Copy size={16} className={copiedKey === apiKey.key ? "text-green-400" : "text-slate-400"} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Created</p>
                    <p>{apiKey.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Last Used</p>
                    <p>{apiKey.lastUsed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Get Subscriber Count</h3>
              <pre className="bg-slate-800 rounded p-4 overflow-x-auto">
                <code className="text-slate-300 text-sm">{`curl -X GET https://api.specflow.ai/v1/metrics/subscribers \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Subscribe User to Newsletter</h3>
              <pre className="bg-slate-800 rounded p-4 overflow-x-auto">
                <code className="text-slate-300 text-sm">{`curl -X POST https://api.specflow.ai/v1/subscribers \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "source": "api"}'`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Get Analytics</h3>
              <pre className="bg-slate-800 rounded p-4 overflow-x-auto">
                <code className="text-slate-300 text-sm">{`curl -X GET "https://api.specflow.ai/v1/analytics?period=30d" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
