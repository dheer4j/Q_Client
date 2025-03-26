import React from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  encryptionActive: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, encryptionActive }) => {
  return (
    <div style={{
      width: '250px',
      backgroundColor: '#1e2533',
      color: 'white',
      height: '100vh',
      padding: '20px 0',
      borderRight: '1px solid #2c3344'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 20px',
        marginBottom: '30px'
      }}>
        <span style={{ 
          color: '#3b82f6', 
          fontSize: '24px', 
          fontWeight: 'bold',
          marginRight: '10px'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
        </span>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Quantum Mail</h1>
        <button style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer'
        }}>
          +
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '10px 20px',
        marginBottom: '20px',
        backgroundColor: '#2a3447',
        color: '#4ade80'
      }}>
        <span style={{ marginRight: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </span>
        <div>
          <div>Quantum Encryption:</div>
          <div style={{ fontWeight: 'bold' }}>{encryptionActive ? 'Active' : 'Inactive'}</div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <SidebarItem 
          label="Inbox" 
          active={activeSection === 'inbox'} 
          onClick={() => onSectionChange('inbox')} 
        />
        <SidebarItem 
          label="Sent" 
          active={activeSection === 'sent'} 
          onClick={() => onSectionChange('sent')} 
        />
        <SidebarItem 
          label="Drafts" 
          active={activeSection === 'drafts'} 
          onClick={() => onSectionChange('drafts')} 
        />
        <SidebarItem 
          label="Encrypted" 
          active={activeSection === 'encrypted'} 
          onClick={() => onSectionChange('encrypted')} 
        />
      </div>
    </div>
  );
};

interface SidebarItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, active, onClick }) => {
  return (
    <div 
      style={{
        padding: '12px 20px',
        cursor: 'pointer',
        backgroundColor: active ? '#2a3447' : 'transparent',
        color: active ? 'white' : '#94a3b8',
        fontWeight: active ? 'bold' : 'normal',
        transition: 'all 0.2s'
      }}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

export default Sidebar;
