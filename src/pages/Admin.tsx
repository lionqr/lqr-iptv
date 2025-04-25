
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-firetv-background text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-firetv-accent rounded-md hover:bg-firetv-accent/80"
          >
            Back to App
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-firetv-dark p-6 rounded-lg">
            <h2 className="text-xl font-medium mb-4">Manage Categories</h2>
            <p className="text-firetv-text-secondary mb-4">
              Add, edit or remove channel categories
            </p>
            <button className="px-3 py-1 bg-firetv-accent rounded-md hover:bg-firetv-accent/80">
              Manage
            </button>
          </div>
          
          <div className="bg-firetv-dark p-6 rounded-lg">
            <h2 className="text-xl font-medium mb-4">Manage Channels</h2>
            <p className="text-firetv-text-secondary mb-4">
              Add, edit or remove channels and assign them to categories
            </p>
            <button className="px-3 py-1 bg-firetv-accent rounded-md hover:bg-firetv-accent/80">
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
