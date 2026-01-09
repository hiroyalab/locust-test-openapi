import React, { useState, useEffect } from 'react';
import LocustGuide from './LocustGuide';
import FakerGuide from './FakerGuide';

const API_BASE = 'http://localhost:8001';

function App() {
  const [endpoints, setEndpoints] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [scenarios, setScenarios] = useState({});
  const [host, setHost] = useState('http://localhost:8000');
  const [isRunning, setIsRunning] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showFakerGuide, setShowFakerGuide] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    checkStatus();
    const timer = setInterval(checkStatus, 5000);
    return () => clearInterval(timer);
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      const data = await res.json();
      setIsRunning(data.is_running);
    } catch (e) {
      console.error("Failed to check status", e);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log("Server response:", data);

      if (res.ok && data && data.endpoints) {
        if (data.endpoints.length === 0) {
          alert("このOpenAPIファイルにはエンドポイントが見つかりませんでした。ファイル構造を確認してください。");
        }
        setEndpoints(data.endpoints);

        // Initialize scenarios
        const initialScenarios = {};
        data.endpoints.forEach((ep, idx) => {
          initialScenarios[idx] = {
            enabled: false, // Default to disabled so user can pick specific APIs
            path: ep.path,
            method: ep.method,
            weight: 1,
            path_params: (ep.parameters || []).filter(p => p.in_ === 'path').reduce((acc, p) => ({ ...acc, [p.name]: p.example !== undefined && p.example !== null ? String(p.example) : "fake.random_int(1, 100)" }), {}),
            query_params: (ep.parameters || []).filter(p => p.in_ === 'query').reduce((acc, p) => ({ ...acc, [p.name]: p.example !== undefined && p.example !== null ? String(p.example) : "fake.word()" }), {}),
            headers: (ep.parameters || []).filter(p => p.in_ === 'header').reduce((acc, p) => ({ ...acc, [p.name]: p.example !== undefined && p.example !== null ? String(p.example) : "" }), {}),
            body: ep.request_body ? {} : null
          };
        });
        setScenarios(initialScenarios);
      } else {
        const errorMsg = data.detail || "サーバーから無効なレスポンスが返されました";
        alert("アップロードに失敗しました: " + errorMsg);
        console.error("Upload error detail:", data);
      }
    } catch (err) {
      alert("アップロードに失敗しました: " + err.message);
      console.error("Network or parsing error:", err);
    }
  };

  const handleRun = async () => {
    const activeScenarios = Object.values(scenarios).filter(s => s.enabled);

    if (activeScenarios.length === 0) {
      alert("テスト対象のAPIを少なくとも1つ選択してください（チェックボックスを使用）。");
      return;
    }

    const payload = {
      wait_min: 1,
      wait_max: 5,
      host,
      scenarios: activeScenarios
    };

    try {
      const res = await fetch(`${API_BASE}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setIsRunning(true);
      window.open(data.locust_ui, '_blank');
    } catch (err) {
      alert("テストの開始に失敗しました: " + err.message);
    }
  };

  const handleStop = async () => {
    try {
      await fetch(`${API_BASE}/stop`, { method: 'POST' });
      setIsRunning(false);
    } catch (err) {
      alert("テストの停止に失敗しました");
    }
  };

  const updateScenario = (idx, field, key, value) => {
    setScenarios(prev => {
      const updated = { ...prev };
      if (key) {
        updated[idx][field][key] = value;
      } else {
        updated[idx][field] = value;
      }
      return updated;
    });
  };

  const selectedEndpoint = selectedIdx !== null ? endpoints[selectedIdx] : null;
  const currentScenario = selectedIdx !== null ? scenarios[selectedIdx] : null;

  return (
    <div className="container">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #00d2ff, #92fe9d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            OpenAPI Locust Architect
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Load testing made elegant.</p>
          <button
            onClick={() => setShowGuide(true)}
            style={{ marginTop: '10px', marginRight: '10px', padding: '4px 12px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
          >
            📚 負荷テストガイド
          </button>
          <button
            onClick={() => setShowFakerGuide(true)}
            style={{ marginTop: '10px', padding: '4px 12px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#92fe9d', border: '1px solid #92fe9d' }}
          >
            🎲 データ生成(Faker)ガイド
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <span className={`status-indicator ${isRunning ? 'status-running' : 'status-stopped'}`}></span>
            <span style={{ fontWeight: 600 }}>{isRunning ? 'RUNNING' : 'IDLE'}</span>
          </div>
          {isRunning ? (
            <button onClick={handleStop} style={{ backgroundColor: 'var(--danger)', color: 'white' }}>STOP TEST</button>
          ) : (
            <button onClick={handleRun} disabled={endpoints.length === 0} style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)' }}>START TEST</button>
          )}
        </div>
      </header>

      <div className="grid">
        {/* Sidebar: YAML Upload and Endpoint List */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Configuration</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>OPENAPI YAML</label>
            <input type="file" onChange={handleUpload} style={{ fontSize: '12px' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>TARGET HOST</label>
            <input type="text" value={host} onChange={e => setHost(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '11px', lineHeight: '1.5' }}>
            <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>🚀 使い方</strong>
            <ol style={{ paddingLeft: '16px', margin: '0' }}>
              <li>YAMLを読み込み、負荷をかけたいAPIをチェック。</li>
              <li>必要に応じてパラメータやWeightを調整。</li>
              <li><strong>START TEST</strong> をクリック。</li>
              <li>自動で開く <strong>Locust Web UI</strong> にて、同時ユーザー数を入力してテストを開始してください。</li>
            </ol>
          </div>

          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', fontSize: '11px', lineHeight: '1.5', marginTop: '12px' }}>
            <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>💡 WEIGHT（重み）とは？</strong>
            複数のAPIを選択している場合のリクエスト頻度の比率です。数値が大きいほど、そのAPIが優先的に実行されます。
          </div>

          <h3 style={{ marginBottom: '16px', marginTop: '32px' }}>Endpoints ({endpoints.length})</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {endpoints.map((ep, idx) => (
              <div
                key={idx}
                className={`endpoint-item ${selectedIdx === idx ? 'selected' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => setSelectedIdx(idx)}
              >
                <input
                  type="checkbox"
                  checked={scenarios[idx]?.enabled || false}
                  onClick={(e) => e.stopPropagation()} // Prevent selecting the endpoint when clicking checkbox
                  onChange={(e) => updateScenario(idx, 'enabled', null, e.target.checked)}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <span className={`method-badge ${ep.method.toLowerCase()}`}>{ep.method}</span>
                  <span style={{ fontSize: '13px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block' }}>{ep.path}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main: Configuration for selected endpoint */}
        <div className="glass-card">
          {!selectedEndpoint ? (
            <div style={{ textAlign: 'center', paddingTop: '100px', color: 'var(--text-muted)' }}>
              Select an endpoint to configure load behavior
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={`method-badge ${selectedEndpoint.method.toLowerCase()}`} style={{ fontSize: '1.2rem', padding: '4px 12px' }}>{selectedEndpoint.method}</span>
                    {selectedEndpoint.path}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{selectedEndpoint.summary || 'No description provided'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>WEIGHT</label>
                  <input
                    type="number"
                    value={currentScenario.weight}
                    onChange={e => updateScenario(selectedIdx, 'weight', null, parseInt(e.target.value))}
                    style={{ width: '60px', textAlign: 'center' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <h3>パラメータと動的データの設定</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <code>fake.name()</code> や <code>fake.random_int(1,100)</code> などのPythonスニペット、または直接の値を入力してください。
                </p>

                {Object.keys(currentScenario.path_params).length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '12px' }}>PATH PARAMETERS</h4>
                    {Object.entries(currentScenario.path_params).map(([key, val]) => (
                      <div key={key} className="param-row">
                        <span style={{ width: '120px', fontSize: '14px' }}>{key}</span>
                        <input
                          type="text"
                          style={{ flex: 1 }}
                          value={val}
                          onChange={e => updateScenario(selectedIdx, 'path_params', key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {Object.keys(currentScenario.query_params).length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '12px' }}>QUERY PARAMETERS</h4>
                    {Object.entries(currentScenario.query_params).map(([key, val]) => (
                      <div key={key} className="param-row">
                        <span style={{ width: '120px', fontSize: '14px' }}>{key}</span>
                        <input
                          type="text"
                          style={{ flex: 1 }}
                          value={val}
                          onChange={e => updateScenario(selectedIdx, 'query_params', key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {Object.keys(currentScenario.headers).length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '12px' }}>HEADERS</h4>
                    {Object.entries(currentScenario.headers).map(([key, val]) => (
                      <div key={key} className="param-row">
                        <span style={{ width: '120px', fontSize: '14px' }}>{key}</span>
                        <input
                          type="text"
                          style={{ flex: 1 }}
                          value={val}
                          placeholder="Example: 'application/json'"
                          onChange={(e) => updateScenario(selectedIdx, 'headers', key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {currentScenario.body !== null && (
                  <div>
                    <h4 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '12px' }}>REQUEST BODY (JSON Snippet)</h4>
                    <textarea
                      style={{ width: '100%', minHeight: '150px', background: 'rgba(15,23,42,0.5)', color: 'white', borderRadius: '8px', padding: '12px', border: '1px solid rgba(148,163,184,0.2)', fontFamily: 'monospace' }}
                      value={JSON.stringify(currentScenario.body, null, 2)}
                      onChange={e => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          updateScenario(selectedIdx, 'body', null, parsed);
                        } catch (e) { }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {showGuide && <LocustGuide onClose={() => setShowGuide(false)} />}
      {showFakerGuide && <FakerGuide onClose={() => setShowFakerGuide(false)} />}
    </div>
  );
}

export default App;
