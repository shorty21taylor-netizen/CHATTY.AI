'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Search,
  Loader2,
  Network,
  User,
  Target,
  Bot,
  FileText,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

const NODE_COLORS = {
  contact: '#3b82f6',
  opportunity: '#f59e0b',
  agent_run: '#8b5cf6',
  brief: '#10b981',
  outcome: '#ef4444',
};

const NODE_ICONS = {
  contact: User,
  opportunity: Target,
  agent_run: Bot,
  brief: FileText,
  outcome: CheckCircle,
};

export default function MemoryGraphPage() {
  const [graph, setGraph] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const fetchGraph = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/memory/search?graph=true&limit=200');
      if (res.ok) {
        const data = await res.json();
        setGraph(data);
      }
    } catch (err) {
      console.error('Failed to load graph:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  useEffect(() => {
    if (!graph || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const positions = new Map();
    const velocities = new Map();

    graph.nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / graph.nodes.length;
      const r = Math.min(width, height) * 0.35;
      positions.set(node.id, {
        x: width / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 40,
        y: height / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 40,
      });
      velocities.set(node.id, { vx: 0, vy: 0 });
    });

    let frame = 0;
    const maxFrames = 200;

    function simulate() {
      if (frame > maxFrames) return;
      frame++;

      graph.nodes.forEach((n1) => {
        const p1 = positions.get(n1.id);
        const v1 = velocities.get(n1.id);
        let fx = 0, fy = 0;

        graph.nodes.forEach((n2) => {
          if (n1.id === n2.id) return;
          const p2 = positions.get(n2.id);
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = 800 / (dist * dist);
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        });

        graph.edges.forEach((edge) => {
          let other = null;
          if (edge.from === n1.id) other = edge.to;
          else if (edge.to === n1.id) other = edge.from;
          if (!other) return;
          const p2 = positions.get(other);
          if (!p2) return;
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = (dist - 120) * 0.01;
          fx += (dx / Math.max(dist, 1)) * force;
          fy += (dy / Math.max(dist, 1)) * force;
        });

        fx += (width / 2 - p1.x) * 0.001;
        fy += (height / 2 - p1.y) * 0.001;

        v1.vx = (v1.vx + fx) * 0.8;
        v1.vy = (v1.vy + fy) * 0.8;
        p1.x += v1.vx;
        p1.y += v1.vy;
        p1.x = Math.max(30, Math.min(width - 30, p1.x));
        p1.y = Math.max(30, Math.min(height - 30, p1.y));
      });

      draw();
      animRef.current = requestAnimationFrame(simulate);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      graph.edges.forEach((edge) => {
        const from = positions.get(edge.from);
        const to = positions.get(edge.to);
        if (!from || !to) return;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = Math.min(edge.weight, 3);
        ctx.stroke();
      });

      graph.nodes.forEach((node) => {
        const pos = positions.get(node.id);
        if (!pos) return;
        const color = NODE_COLORS[node.type] || '#6b7280';
        const radius = 8 + Math.min(node.relevance * 4, 12);
        const isSelected = selectedNode?.id === node.id;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#fff' : color;
        ctx.fill();
        ctx.strokeStyle = isSelected ? color : 'rgba(255,255,255,0.6)';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.stroke();

        if (graph.nodes.length < 50) {
          const label = node.summary?.slice(0, 20) || node.entity_id.slice(0, 8);
          ctx.font = '10px system-ui';
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(label, pos.x, pos.y + radius + 14);
        }
      });
    }

    simulate();

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const node of graph.nodes) {
        const pos = positions.get(node.id);
        if (!pos) continue;
        const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
        if (dist < 16) {
          setSelectedNode(node);
          draw();
          return;
        }
      }
      setSelectedNode(null);
      draw();
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('click', handleClick);
    };
  }, [graph, selectedNode]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/memory/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Network className="h-6 w-6 text-blue-400" />
            Memory Graph
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visual knowledge graph of your contacts, opportunities, agents, and outcomes
          </p>
        </div>
        <button
          onClick={fetchGraph}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory graph (semantic search)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      <div className="flex gap-3 text-xs text-slate-400">
        {Object.entries(NODE_COLORS).map(([type, color]) => {
          const Icon = NODE_ICONS[type] || Network;
          return (
            <div key={type} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
              <Icon className="h-3 w-3" />
              {type.replace('_', ' ')}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden" style={{ minHeight: 500 }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : !graph || graph.nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-8">
              <Network className="h-12 w-12 opacity-30" />
              <p>No memory nodes yet. The nightly graph build creates nodes from your signal events.</p>
            </div>
          ) : (
            <canvas ref={canvasRef} className="w-full" style={{ height: 500 }} />
          )}
        </div>

        <div className="space-y-4">
          {selectedNode && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                {(() => { const Icon = NODE_ICONS[selectedNode.type] || Network; return <Icon className="h-4 w-4" />; })()}
                {selectedNode.type.replace('_', ' ')}
              </h3>
              <p className="text-sm text-slate-300 mb-2">{selectedNode.summary || 'No summary'}</p>
              <div className="text-xs text-slate-500 space-y-1">
                <div>Entity: {selectedNode.entity_id.slice(0, 8)}...</div>
                <div>Relevance: {selectedNode.relevance}</div>
              </div>
            </div>
          )}

          {graph && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Graph Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Nodes</span>
                  <span className="text-white font-medium">{graph.nodes.length}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Edges</span>
                  <span className="text-white font-medium">{graph.edges.length}</span>
                </div>
                {Object.entries(
                  graph.nodes.reduce((acc, n) => {
                    acc[n.type] = (acc[n.type] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NODE_COLORS[type] || '#6b7280' }} />
                      {type}
                    </span>
                    <span className="text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                Search Results ({searchResults.length})
              </h3>
              {searchResults.length === 0 ? (
                <p className="text-sm text-slate-400">No matches found</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {searchResults.map((result, i) => (
                    <div
                      key={result.id || i}
                      className="p-2 rounded-lg bg-slate-700/50 cursor-pointer hover:bg-slate-700 transition"
                      onClick={() => setSelectedNode(result)}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: NODE_COLORS[result.node_type] || '#6b7280' }}
                        />
                        <span className="text-slate-300 font-medium">{result.node_type}</span>
                        {result.similarity && (
                          <span className="text-slate-500 ml-auto">
                            {Math.round(result.similarity * 100)}% match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {result.summary || 'No summary'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
