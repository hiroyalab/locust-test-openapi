import React from 'react';

const LocustGuide = ({ onClose }) => {
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
                    maxWidth: '900px',
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
                        cursor: 'pointer'
                    }}
                >×</button>

                <h1 style={{ marginBottom: '30px', color: 'var(--primary)', textAlign: 'center' }}>Locust 負荷テスト・マスターガイド</h1>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '12px', marginBottom: '20px', fontSize: '1.4rem' }}>1. 基本パラメータ解説</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: 'var(--secondary)', marginBottom: '10px' }}>Number of users</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <strong>「最終的に何人で攻めるか」</strong><br />
                                システムに同時にアクセスする仮想ユーザーの総数です。各ユーザーは独立して動き、設定されたAPIをランダムに（Weightに基づき）叩き続けます。
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: 'var(--secondary)', marginBottom: '10px' }}>Spawn rate (Ramp-up)</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <strong>「1秒間に何人ずつ増やすか」</strong><br />
                                ユーザーが目標数に達するまでの加速速度です。
                                <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '0.85rem' }}>
                                    <strong>計算式:</strong> 目標ユーザー数 ÷ 到達させたい時間(秒)<br />
                                    例: 100人まで50秒かけて増やしたい → <strong>2</strong> を設定
                                </div>
                            </p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '12px', marginBottom: '20px', fontSize: '1.4rem' }}>2. Advanced Options (高度な設定)</h2>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Run time (テスト実行時間)</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                                テストを自動で停止させる時間です（例: `1h30m`, `300s`, `5m`）。設定しない場合は手動で停止するまで動き続けます。
                            </p>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '12px', marginBottom: '20px', fontSize: '1.4rem' }}>3. シナリオ別・実行例</h2>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>テスト種類</th>
                                <th style={{ padding: '12px' }}>Users</th>
                                <th style={{ padding: '12px' }}>Spawn Rate</th>
                                <th style={{ padding: '12px' }}>目的</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px' }}><strong>ロードテスト</strong></td>
                                <td style={{ padding: '12px' }}>100</td>
                                <td style={{ padding: '12px' }}>5〜10</td>
                                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>通常〜ピーク時の性能確認。</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px' }}><strong>ステップテスト</strong></td>
                                <td style={{ padding: '12px' }}>500</td>
                                <td style={{ padding: '12px' }}>1〜2</td>
                                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>徐々に増やし、処理限界(RPSの飽和)を探る。</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px' }}><strong>スパイクテスト</strong></td>
                                <td style={{ padding: '12px' }}>300</td>
                                <td style={{ padding: '12px' }}>100〜300</td>
                                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>一気にユーザーを増やし、突発負荷への耐性を確認。</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <div style={{ background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.2), rgba(0, 210, 255, 0.2))', padding: '24px', borderRadius: '16px', border: '1px solid var(--accent)' }}>
                    <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>📊</span> 結果の見極めポイント
                    </h3>
                    <ul style={{ fontSize: '0.95rem', lineHeight: '1.8', listStyle: 'none', padding: 0 }}>
                        <li>✅ <strong>RPS (Total Requests per Second):</strong> システムの「秒間処理数」。Userを増やしてもここが上がらなくなったら限界です。</li>
                        <li>✅ <strong>95%ile Response Time:</strong> 「ほとんどのユーザー（95%）がこの秒数以内に返ってきた」という指標。平均よりこちらを重視しましょう。</li>
                        <li>✅ <strong>Failures:</strong> 限界を超えるとタイムアウトや5xxエラーが増え始めます。</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LocustGuide;
