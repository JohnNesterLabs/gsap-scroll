import React, { useState } from 'react';
import Demo from './Demo';
import DemoEasing from './DemoEasing';
import DemoMultiplier from './DemoMultiplier';
import DemoCurve from './DemoCurve';

export default function DemoTest() {
    const [activeDemo, setActiveDemo] = useState('original');

    const demos = {
        original: { component: Demo, name: 'Original Demo' },
        easing: { component: DemoEasing, name: 'Easing Demo' },
        multiplier: { component: DemoMultiplier, name: 'Multiplier Demo' },
        curve: { component: DemoCurve, name: 'Curve Demo' }
    };

    const ActiveComponent = demos[activeDemo].component;

    return (
        <div style={{ position: 'relative' }}>
            {/* Demo Selector */}
            <div style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                zIndex: 1001,
                background: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                fontFamily: 'monospace',
                minWidth: '200px'
            }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Demo Selector</h3>
                {Object.entries(demos).map(([key, demo]) => (
                    <div key={key} style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="demo"
                                value={key}
                                checked={activeDemo === key}
                                onChange={(e) => setActiveDemo(e.target.value)}
                                style={{ marginRight: '8px' }}
                            />
                            <span style={{ fontSize: '14px' }}>{demo.name}</span>
                        </label>
                    </div>
                ))}

                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '5px',
                    fontSize: '12px'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Current: {demos[activeDemo].name}</div>
                    <div style={{ color: '#ccc' }}>
                        {activeDemo === 'original' && '• Standard scroll behavior'}
                        {activeDemo === 'easing' && '• Easing functions control scroll speed'}
                        {activeDemo === 'multiplier' && '• Multiplier-based speed control'}
                        {activeDemo === 'curve' && '• Mathematical curve-based control'}
                    </div>
                </div>
            </div>

            {/* Active Demo Component */}
            <ActiveComponent />
        </div>
    );
}
