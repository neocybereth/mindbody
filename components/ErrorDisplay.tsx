"use client";

export function ErrorDisplay({ error }: { error: Error }) {
  const errorMessage = error.message || "An error occurred";
  
  // Check for specific error types
  const isAuthError = errorMessage.toLowerCase().includes("authentication") || 
                      errorMessage.toLowerCase().includes("credentials");
  const isMindbodyError = errorMessage.toLowerCase().includes("mindbody");
  const isOpenRouterError = errorMessage.toLowerCase().includes("openrouter");

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 max-w-3xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-600 text-2xl">⚠️</span>
        <span className="text-sm font-semibold text-red-800">Error</span>
      </div>
      
      <div className="text-red-700 mb-3">{errorMessage}</div>

      {isAuthError && (
        <div className="mt-3 p-3 bg-red-100 rounded-lg text-sm text-red-800">
          <p className="font-semibold mb-1">Authentication Issue Detected</p>
          <p>Check your credentials in <code className="bg-red-200 px-1 rounded">.env.local</code></p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>Verify <code>MINDBODY_API_KEY</code> is set</li>
            <li>Verify <code>MINDBODY_SOURCE_NAME</code> (your Mindbody username)</li>
            <li>Verify <code>MINDBODY_SOURCE_PASSWORD</code> (your Mindbody password)</li>
          </ul>
          <p className="mt-2">
            See <code className="bg-red-200 px-1 rounded">AUTHENTICATION_GUIDE.md</code> for detailed help.
          </p>
        </div>
      )}

      {isMindbodyError && !isAuthError && (
        <div className="mt-3 p-3 bg-red-100 rounded-lg text-sm text-red-800">
          <p className="font-semibold mb-1">Mindbody API Issue</p>
          <p>There was a problem connecting to Mindbody. Check:</p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>Your API key is valid at <a href="https://developers.mindbodyonline.com/" className="underline">developers.mindbodyonline.com</a></li>
            <li>Your site ID is correct (use -99 for all sites)</li>
            <li>The Mindbody API is operational</li>
          </ul>
        </div>
      )}

      {isOpenRouterError && (
        <div className="mt-3 p-3 bg-red-100 rounded-lg text-sm text-red-800">
          <p className="font-semibold mb-1">OpenRouter API Issue</p>
          <p>Check your OpenRouter API key in <code className="bg-red-200 px-1 rounded">.env.local</code></p>
          <p className="mt-2">
            Get an API key at: <a href="https://openrouter.ai/" className="underline" target="_blank">openrouter.ai</a>
          </p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-red-300">
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-red-700 hover:text-red-900 underline"
        >
          Refresh page to try again
        </button>
      </div>
    </div>
  );
}

