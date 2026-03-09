import React, { useState } from 'react';
import type { StoryChoice, StoryEvent } from '../config/storyData';

interface StoryModalProps {
  event: StoryEvent;
  onChoice: (eventId: string, charmReward: number, affectionReward: number, hpCost: number) => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ event, onChoice }) => {
  const [selectedChoice, setSelectedChoice] = useState<StoryChoice | null>(null);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.85)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'white', border: 'var(--border-cute)', borderRadius: 'var(--radius-cute)',
        width: '90%', maxWidth: '600px', overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(255,105,180,0.4)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ background: 'var(--color-primary)', color: 'white', padding: '16px 24px', fontWeight: 'bold', fontSize: '1.2rem' }}>
          ✨ {event.title}
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1 }}>
          <div style={{ 
            background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', 
            fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '24px',
            border: '1px solid #ffb6c1'
          }}>
            {selectedChoice ? selectedChoice.response : event.dialogue}
          </div>

          {!selectedChoice ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {event.choices.map((choice, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedChoice(choice)}
                  style={{
                    padding: '16px', background: 'white', border: '2px solid var(--color-secondary)',
                    borderRadius: '12px', cursor: 'pointer', fontSize: '1rem',
                    textAlign: 'left', fontWeight: 'bold', transition: 'all 0.2s',
                    color: 'var(--text-main)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={() => onChoice(event.id, selectedChoice.charmReward, selectedChoice.affectionReward, selectedChoice.hpCost)}
                style={{
                  padding: '12px 32px', background: 'var(--color-primary)', color: 'white',
                  border: 'none', borderRadius: '24px', fontSize: '1.1rem',
                  fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,105,180,0.3)'
                }}
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
