import React from 'react';

const FakerGuide = ({ onClose }) => {
    const examples = [
        { title: '氏名', code: 'fake.name()', result: '山田 太郎 / Jane Doe' },
        { title: '住所', code: 'fake.address()', result: '東京都港区... / 123 Main St' },
        { title: 'メールアドレス', code: 'fake.email()', result: 'example@mail.com' },
        { title: '数値（範囲指定）', code: 'fake.random_int(1, 100)', result: '42' },
        { title: '日付', code: 'fake.date()', result: '2023-01-23' },
        { title: '単語', code: 'fake.word()', result: 'architect' },
        { title: '文章（1文）', code: 'fake.sentence()', result: 'The quick brown fox...' },
        { title: '電話番号', code: 'fake.phone_number()', result: '090-1234-5678' },
        { title: 'UUID', code: 'fake.uuid4()', result: '550e8400-e29b-41d4-a716-446655440000' },
        { title: 'User-Agent', code: 'fake.user_agent()', result: 'Mozilla/5.0...' }
    ];

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
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    position: 'relative',
                    padding: '40px',
                    border: '1px solid rgba(146, 254, 157, 0.3)',
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

                <h1 style={{ marginBottom: '24px', color: '#92fe9d', textAlign: 'center' }}>Faker (自動データ生成) ガイド</h1>

                <p style={{ marginBottom: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    入力欄に以下のコード（<code>fake.〜</code>）を入力することで、テスト実行ごとにランダムな値を自動生成します。
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {examples.map((item, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#92fe9d', marginBottom: '4px' }}>{item.title}</div>
                            <code style={{ display: 'block', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', marginBottom: '8px', fontSize: '1rem' }}>
                                {item.code}
                            </code>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                例: {item.result}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(146, 254, 157, 0.1)', borderRadius: '8px', border: '1px solid rgba(146, 254, 157, 0.2)', fontSize: '0.9rem' }}>
                    <strong>💡 ヒント:</strong><br />
                    - Pythonの組み込み関数も使用可能です（例: <code>str(random.randint(1,1000))</code>）。<br />
                    - <code>fake.</code> で始まらないテキストを入力した場合は、そのまま固定値として扱われます。
                </div>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
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

export default FakerGuide;
