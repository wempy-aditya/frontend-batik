// Simple test component to check if icons render properly
"use client";

const TestComponent = () => {
  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold mb-4">Icon Test</h1>
      
      {/* Test different icon sizes */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span>w-4 h-4:</span>
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        
        <div className="flex items-center gap-4">
          <span>w-5 h-5:</span>
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        
        <div className="flex items-center gap-4">
          <span>w-6 h-6:</span>
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        
        <div className="flex items-center gap-4">
          <span>w-8 h-8:</span>
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
