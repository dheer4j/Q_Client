import React from 'react';

// Icons
const InboxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const DraftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const LockClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ComposeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

interface SidebarProps {
  activeFolder: string;
  onFolderSelect: (folder: string) => void;
  onComposeClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeFolder, 
  onFolderSelect,
  onComposeClick
}) => {
  const folders = [
    { id: 'Inbox', name: 'Inbox', icon: <InboxIcon />, count: 5 },
    { id: 'Starred', name: 'Starred', icon: <StarIcon />, count: 2 },
    { id: 'Sent', name: 'Sent', icon: <SentIcon />, count: 0 },
    { id: 'Drafts', name: 'Drafts', icon: <DraftIcon />, count: 1 },
    { id: 'Encrypted', name: 'Encrypted', icon: <LockClosedIcon />, count: 3 },
    { id: 'Trash', name: 'Trash', icon: <TrashIcon />, count: 0 },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 p-4">
      <div className="mb-8">
        <button
          onClick={onComposeClick}
          className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium"
        >
          <ComposeIcon />
          Compose
        </button>
      </div>
      
      <nav>
        <ul className="space-y-1">
          {folders.map((folder) => (
            <li key={folder.id}>
              <button
                onClick={() => onFolderSelect(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-150 ${
                  activeFolder === folder.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  {folder.icon}
                  <span>{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeFolder === folder.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {folder.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-8 pt-8 border-t border-gray-700">
        <div className="text-xs text-gray-500 mb-2">Storage</div>
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>2.5 GB of 15 GB used</span>
            <span>17%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '17%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
