import React from 'react';

const UsageGuide = ({ onClose }) => {
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '20px',
                cursor: 'pointer'
            }}>
            <div
                className="glass-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative',
                    padding: '40px',
                    border: '1px solid rgba(0, 210, 255, 0.3)',
                    cursor: 'default'
                }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '28px',
                        cursor: 'pointer',
                        padding: '0',
                        width: 'auto',
                        height: 'auto'
                    }}
                >×</button>

                <h2 style={{ marginBottom: '24px', color: 'var(--primary)', textAlign: 'center' }}>クイックガイド</h2>

                <section style={{ marginBottom: '32px' }}>
                    <h3 style={{ color: 'var(--secondary)', marginBottom: '12px', fontSize: '1.1rem' }}>🚀 使い方</h3>
                    <ol style={{ paddingLeft: '20px', lineHeight: '1.8', color: 'var(--text)' }}>
                        <li><strong>OpenAPI YAMLをアップロード:</strong> 左上のエリアにファイルをドラッグ＆ドロップしてください。</li>
                        <li><strong>APIを選択:</strong> リストから負荷テストの対象にしたいAPIのチェックボックスをオンにします。</li>
                        <li><strong>設定を調整:</strong>
                            <ul style={{ paddingLeft: '20px', marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <li><strong>Weight:</strong> 複数のAPIを実行する際の頻度の比率。</li>
                                <li><strong>Params/Body:</strong> 送信データのサンプルを調整。<code>fake.name()</code> 等のFakerも利用可能。</li>
                            </ul>
                        </li>
                        <li><strong>テスト開始:</strong> <strong>START TEST</strong> をクリックするとLocustが起動し、自動的にダッシュボードが開きます。</li>
                    </ol>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h3 style={{ color: 'var(--secondary)', marginBottom: '12px', fontSize: '1.1rem' }}>💡 WEIGHT（重み）とは？</h3>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                            複数のAPIを選択している場合のリクエスト頻度の比率です。数値が大きいほど、そのAPIが優先的に実行されます。
                        </p>
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <strong>例:</strong><br />
                            GET /users (Weight: 3)<br />
                            POST /login (Weight: 1)<br />
                            —&gt; 全体の 3/4 がGET、1/4 がPOSTになります。
                        </div>
                    </div>
                </section>

                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{ background: 'var(--primary)', color: 'var(--bg)', padding: '10px 32px' }}
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UsageGuide;
