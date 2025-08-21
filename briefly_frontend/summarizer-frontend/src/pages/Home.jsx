import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { removeToken } from '../utils/tokenUtils'; // Utility to remove token from localStorage
import { LogOut } from "lucide-react";
import { getToken } from "../utils/tokenUtils";

const isValidMediaFile = (file) => {
  const allowedTypes = [
    "audio/mpeg",      // .mp3
    "audio/wav",       // .wav
    "audio/x-wav",
    "audio/mp4",       // .m4a
    "audio/webm",
    "video/mp4",       // optional if video files allowed
    "video/webm",
  ];

  return file && allowedTypes.includes(file.type);
};

const Home = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [tokens, setTokens] = useState(null);

  const handleTryAgain = () => {
    navigate("/");
  };

  useEffect(() => {
    const token = getToken();
    const fetchTokenCount = async () => {
      try {
        const res = await fetch("http://localhost:8000/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();
        setTokens(data.tokens_left);
      } catch (err) {
        console.error(err);
        toast.error("⚠️ Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    fetchTokenCount();
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!isValidMediaFile(selectedFile)) {
      toast.error("Invalid file type. Please upload an audio or video file.", { duration: 4000 });
      return;
    }
    setFile(selectedFile);
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select an audio file first.", { duration: 3500 });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = getToken();

      const uploadResponse = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text(); // to get raw error (if any)
        toast.error(`⚠️ Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`, { duration: 4000 });

        console.error("Backend Error Response:", errorText);
        return;
      }

      const uploadData = await uploadResponse.json();
      const transcript_id = uploadData.transcript_id;

      // Step 2: Process the file (use POST instead of GET)
      const processResponse = await fetch(`http://localhost:8000/process/${transcript_id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!processResponse.ok) {
        const errorText = await processResponse.text();
        toast.error(`⚠️ Processing failed: ${processResponse.status} ${processResponse.statusText}`, { duration: 4000 });
        console.error("Backend Process Error:", errorText);
        return;
      }

      navigate("/result", { state: { transcriptId: transcript_id } });
    } catch (error) {
      console.error("Network or Server Error:", error);
      toast.error("⚠️ Server error. Please try again later.", { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center px-4 relative"
    >
      {/* Top Right: Token Count & Logout */}
      <div className="absolute top-5 right-5 flex items-center gap-4 z-20">
        <div className="text-gray-700 font-medium bg-white px-4 py-2 rounded-lg shadow-md text-sm">
          🎫 Tokens Left: {tokens !== null ? tokens : "Loading..."}
        </div>
        <button
          onClick={handleLogout}
          className="relative bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg transition duration-200"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full sm:max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800 text-center">
          Upload Meeting Audio
        </h1>
        <p className="text-gray-500 text-center">
          Get AI-powered summaries from your recorded discussions
        </p>

        {/* Upload Section */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const droppedFile = e.dataTransfer.files[0];
              if (!isValidMediaFile(droppedFile)) {
                toast.error("Invalid file type. Please upload an audio or video file.", { duration: 4000 });
                return;
              }
              setFile(droppedFile);
            }}
            className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer 
              ${isDragging ? "bg-blue-100 border-blue-500 text-blue-700" :
                file ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 hover:border-blue-500"} 
              focus-within:ring-2 focus-within:ring-blue-400 shadow-lg`}
          >
            <Upload className="mx-auto mb-2 text-blue-400" size={36} />
            <p className="text-gray-600 break-words">
              {file ? file.name : "Click to upload or drag an audio file"}
            </p>
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Uploading..." : "Upload & Summarize"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { Upload, Loader2, LogOut } from "lucide-react";
// import { motion } from "framer-motion";
// import { getToken } from "../utils/tokenUtils";

// const isValidMediaFile = (file) => {
//   const allowedTypes = [
//     "audio/mpeg",
//     "audio/wav",
//     "audio/x-wav",
//     "audio/mp4",
//     "audio/webm",
//     "video/mp4",
//     "video/webm",
//   ];

//   return file && allowedTypes.includes(file.type);
// };

// const Home = () => {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const [tokens, setTokens] = useState(null);
//   const [isDragging, setIsDragging] = useState(false);

//   useEffect(() => {
//     const token = getToken();
//     const fetchTokenCount = async () => {
//       try {
//         const res = await fetch("http://localhost:8000/me", {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!res.ok) throw new Error("Unauthorized");

//         const data = await res.json();
//         setTokens(data.tokens_left);
//       } catch (err) {
//         console.error(err);
//         toast.error("⚠️ Session expired. Please login again.");
//         localStorage.removeItem("token");
//         navigate("/");
//       }
//     };
//     fetchTokenCount();
//   }, [navigate]);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (!isValidMediaFile(selectedFile)) {
//       toast.error("Invalid file type. Please upload an audio or video file.", { duration: 4000 });
//       return;
//     }
//     setFile(selectedFile);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       toast.warning("Please select an audio file first.", { duration: 3500 });
//       return;
//     }

//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       const token = getToken();

//       const uploadResponse = await fetch("http://localhost:8000/upload", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       if (!uploadResponse.ok) {
//         const errorText = await uploadResponse.text();
//         toast.error(`⚠️ Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`, { duration: 4000 });
//         console.error("Backend Error Response:", errorText);
//         return;
//       }

//       const uploadData = await uploadResponse.json();
//       const transcript_id = uploadData.transcript_id;

//       const processResponse = await fetch(`http://localhost:8000/process/${transcript_id}`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       if (!processResponse.ok) {
//         const errorText = await processResponse.text();
//         toast.error(`⚠️ Processing failed: ${processResponse.status} ${processResponse.statusText}`, { duration: 4000 });
//         console.error("Backend Process Error:", errorText);
//         return;
//       }

//       navigate("/result", { state: { transcriptId: transcript_id } });
//     } catch (error) {
//       console.error("Network or Server Error:", error);
//       toast.error("⚠️ Server error. Please try again later.", { duration: 4000 });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/");
//   };

//   return (
//     <>
//       {/* Navbar
//       <nav className="w-full fixed top-0 left-0 bg-white border-b border-gray-200 shadow-sm z-30 px-6 py-3 flex items-center justify-between">
//         <div className="text-xl font-semibold text-blue-600">Summarizer</div>
//         <div className="flex items-center gap-4">
//           <div className="text-gray-700 font-medium bg-gray-100 px-3 py-1.5 rounded-full shadow-inner text-sm flex items-center gap-1">
//             🎫 <span>{tokens !== null ? tokens : "..."}</span>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-md transition duration-200"
//           >
//             <LogOut size={18} />
//           </button>
//         </div>
//       </nav> */}

//       {/* Main Content */}
//       <motion.div
//   initial={{ opacity: 0 }}
//   animate={{ opacity: 1 }}
//   transition={{ duration: 0.4 }}
//   className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center px-4 pt-24"
// >
//   <div className="w-full sm:max-w-xl bg-white rounded-3xl shadow-xl p-6 sm:p-10 space-y-8 border border-blue-100">
//     <div className="text-center space-y-2">
//       <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
//         Upload Your Meeting Audio
//       </h1>
//       <p className="text-gray-500 text-lg">
//         Get instant, AI-powered summaries of your discussions.
//       </p>
//     </div>

//     {/* Upload Section */}
//     <div className="flex flex-col items-center justify-center space-y-5">
//       <label
//         onDragOver={(e) => {
//           e.preventDefault();
//           setIsDragging(true);
//         }}
//         onDragLeave={() => setIsDragging(false)}
//         onDrop={(e) => {
//           e.preventDefault();
//           setIsDragging(false);
//           const droppedFile = e.dataTransfer.files[0];
//           if (!isValidMediaFile(droppedFile)) {
//             toast.error("Invalid file type. Please upload an audio or video file.", { duration: 4000 });
//             return;
//           }
//           setFile(droppedFile);
//         }}
//         className={`w-full sm:w-4/5 border-2 border-dashed rounded-xl px-6 py-8 text-center transition cursor-pointer 
//           ${isDragging ? "bg-blue-50 border-blue-400 shadow-lg" :
//             file ? "bg-blue-100 border-blue-500 shadow-inner" : "bg-gray-50 border-gray-300 hover:shadow-md"} 
//           focus-within:ring-2 focus-within:ring-blue-400`}
//       >
//         <Upload className="mx-auto mb-3 text-blue-500" size={34} />
//         <p className="text-gray-700 font-medium">
//           {file ? file.name : "Click or drag an audio/video file here"}
//         </p>
//         <input
//           type="file"
//           accept="audio/*,video/*"
//           onChange={handleFileChange}
//           className="hidden"
//         />
//       </label>

//       {/* Upload Button */}
//       <button
//         onClick={handleUpload}
//         disabled={loading}
//         className="bg-blue-600 text-white text-lg px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//       >
//         {loading && <Loader2 className="animate-spin" size={20} />}
//         {loading ? "Uploading..." : "Upload & Summarize"}
//       </button>
//     </div>
//   </div>
// </motion.div>

//     </>
//   );
// };

// export default Home;
