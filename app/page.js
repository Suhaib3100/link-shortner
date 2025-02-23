'use client';
import { useState } from "react";

export default function Home() {
const [loading, setLoading] = useState(false);
const [shortUrl, setShortUrl] = useState("");
const [inputUrl, setInputUrl] = useState("");
const [customAlias, setCustomAlias] = useState("");
const [error, setError] = useState("");

   const handleShorter = async () => {
    if(!inputUrl) {
      setError("Please enter a URL");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/urls/shorten", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: inputUrl,
          customCode: customAlias || undefined
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      setShortUrl(data.shortUrl);
    } catch (error) {
      setError(error.message || "An error occurred while shortening the URL");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipBoard = () => {
    navigator.clipboard.writeText(shortUrl);
    alert("Copied to Clipboard")
  }

  return (
   <div className="flex items-center justify-center bg-gray-200 min-h-screen ">
   <div className="bg-white p-9 rounded-xl shadow-md max-w-md w-full">
     <h1 className="text-2xl font-bold text-center text-white bg-gray-900 p-2 rounded-lg">Shorten Your Link</h1>
     <p className="text-gray-600 text-center mt-2 ">Shorten your long links efficiently with no irritative Ads or Routes!!</p>
     <input type="url" placeholder="Enter Your url"  
      value={inputUrl} onChange={(e) => setInputUrl(e.target.value)}
      onKeyPress={(e) => e.key === "Enter" && handleShorter()}
      className="w-full text-gray-600 mt-2 text-center p-2 border rounded-lg"></input>

     <input 
      type="text" 
      placeholder="Custom alias (optional)"  
      value={customAlias} 
      onChange={(e) => setCustomAlias(e.target.value)}
      className="w-full text-gray-600 mt-2 text-center p-2 border rounded-lg"
     />

     {error && (
       <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
     )}

     <button 
      onClick={handleShorter}
      className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-900 transition duration-300" 
      disabled={loading}
     >
      {loading ? "shortening..." : "Shorten your Link"}
     </button>

     {shortUrl && (
       <div>
         <p className="text-gray-400 mt-4 text-center break-all">{shortUrl}</p>
         <div className="text-center mt-4">
           <button
             onClick={copyToClipBoard}
             className="mt-2 bg-green-400 text-white rounded-md py-2 px-4 hover:bg-green-600 transition duration-300"
           > 
             Copy macha
           </button>
         </div>
       </div>
     )}

     <p className="text-sm text-gray-500 text-center mt-4">Made by Suhaib & Tharun </p>
    </div>
   </div>
  );
}