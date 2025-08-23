import React from 'react';

export default function LayoutEnhancementNote() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-200 border-l-4 border-yellow-500 p-3 rounded shadow-lg max-w-xs">
        <p className="text-xs text-yellow-800">
          💡 <strong>Layout Enhanced:</strong> Window width increased to 1440px for better visibility. 
          Card width: 300px, spacing: 30px, content padding: 40px. Responsive design preserved below 768px.
        </p>
      </div>
    </div>
  );
}