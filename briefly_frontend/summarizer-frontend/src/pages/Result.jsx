// import React, { useEffect, useState, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { jsPDF } from "jspdf";
// import { ArrowLeft, ClipboardCopy, Download } from "lucide-react";
// import { Loader2 } from "lucide-react";
// import { Button, Card } from "react-bootstrap";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { CSSTransition } from "react-transition-group";
// import "./Result.css"; // Add custom CSS for animations

// const Result = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { transcriptId } = location.state || {};
//   const hasDeductedRef = useRef(false);
//   const task_id = transcriptId;

//   const [categorizedSummary, setCategorizedSummary] = useState(null);
//   const [actionItems, setActionItems] = useState([]);
//   const [transcript, setTranscript] = useState("");
//   const [summaryType, setSummaryType] = useState(null);
//   const [summaryData, setSummaryData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [tokenDeducted, setTokenDeducted] = useState(false);
//   const [tokensLeft, setTokensLeft] = useState(null);
//   const [showTranscript, setShowTranscript] = useState(false); // Manage transcript visibility
//   const [fromLocalStorage, setFromLocalStorage] = useState(false);

//   const transcriptRef = useRef(null);

//   const handleTryAgain = () => {
//     navigate("/home");
//   };

//   useEffect(() => {
//     const local = localStorage.getItem("summaryData");
//     if (local) {
//       const data = JSON.parse(local);
//       setFromLocalStorage(true);
//       setSummaryType(data.type);
//     }
//   }, []);

//   // Deduct token once summary is successfully returned
//   useEffect(() => {
//     const deductToken = async () => {
//       try {
//         const res = await fetch("http://127.0.0.1:8000/deduct-token", {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });

//         if (!res.ok) throw new Error("Token deduction failed");
//         const data = await res.json();
//         setTokensLeft(data.tokens_left);
//         setTokenDeducted(true);
//       } catch (err) {
//         console.error("Error deducting token:", err);
//         toast.error("Failed to deduct token.");
//       }
//     };

//     if ((summaryData|| categorizedSummary) && !hasDeductedRef.current && !fromLocalStorage) {
//       hasDeductedRef.current = true;
//       deductToken();
//     }
//   }, [summaryData, categorizedSummary, fromLocalStorage]);

//   // Poll summary data
//   useEffect(() => {
//     let intervalId;
  
//     const fetchSummary = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/result/${task_id}`, {
//           method: "GET", // ✅ It should be GET for polling
//         });
//         const data = await response.json();
//         const result = data.data;
//         console.log("Data : ", data);
//         console.log("Data of data : ", data.data);
//         console.log("Result : ", result);
//         if (data.status === "completed")
//           {
//           setSummaryType(result.type);
//           setTranscript(result.transcript);
//           console.log("Type : ", result.type);
  
//           if (result.type === "meeting") {
//             setCategorizedSummary(result.categorized_summary || {});
//             //setActionItems(data.action_items || []);
  
//             localStorage.setItem(
//               "summaryData",
//               JSON.stringify({
//                 type: result.type,
//                 categorized_summary: result.categorized_summary,
//                 transcript:result.transcript,
//                 //action_items: data.action_items,
//               })
//             );
//             console.log("Summary data : ", summaryData);
//           } else {
//             setSummaryData({
//               summary: result.summary,
//               transcript: result.transcript,
//             });
  
//             localStorage.setItem(
//               "summaryData",
//               JSON.stringify({
//                 type: result.type,
//                 summary: result.summary,
//                 transcript: result.transcript,
//               })
//             );
//             console.log("Summary data : ", summaryData);
//           }
  
//           clearInterval(intervalId); // ✅ Stop polling
//           setLoading(false);
//         } else if (data.status === "failed") {
//           toast.error("Summary generation failed.");
//           clearInterval(intervalId); // ✅ Stop polling
//           setLoading(false);
//         }
//         // If "processing", do nothing. Next poll will happen.
//       } catch (err) {
//         console.error("Polling error:", err);
//         toast.error("Something went wrong.");
//         clearInterval(intervalId); // ✅ Stop polling
//         setLoading(false);
//       }
//     };
  
//     if (transcriptId) {
//       fetchSummary(); // Immediate first fetch
//       intervalId = setInterval(fetchSummary, 4000); // Then poll every 4 seconds
//     } else {
//       toast.error("No transcript ID provided.");
//       setLoading(false);
//     }
  
//     return () => clearInterval(intervalId); // ✅ Cleanup on unmount
//   }, [transcriptId]);
  

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[70vh] text-center">
//         <Loader2 className="animate-spin text-blue-500 w-10 h-10 mb-4" />
//         <p className="text-lg">Processing your file... This may take a few seconds.</p>
//       </div>
//     );
//   }

//   if (!summaryData  && !categorizedSummary) {
//     console.log(summaryData.data)
//     return (
//       <div className="text-center mt-20">
//         <p className="text-lg text-red-600 mb-4">Unable to load summary.</p>
//         <Button
//           variant="dark"
//           onClick={handleTryAgain}
//           className="inline-flex items-center gap-2"
//         >
//           <ArrowLeft size={18} />
//           Try Again
//         </Button>
//       </div>
//     );
//   }

//   const exportAsTxt = (text, filename) => {
//   const blob = new Blob([text], { type: "text/plain" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `${filename}.txt`;
//   a.click();
//   URL.revokeObjectURL(url);
// };

// const exportAsPDF = (text, filename) => {
//   const doc = new jsPDF();
//   const lines = doc.splitTextToSize(text, 180);
//   doc.text(lines, 10, 10);
//   doc.save(`${filename}.pdf`);
// };

// const copyToClipboard = (text) => {
//   navigator.clipboard.writeText(text)
//     .then(() => toast.success("Copied to clipboard!"))
//     .catch(() => toast.error("Copy failed."));
// };

// const getFormattedSummaryText = () => {
//   if (summaryType === "meeting" && categorizedSummary) {
//     return Object.entries(categorizedSummary)
//       .map(([category, content]) => `${category.toUpperCase()}:\n${content}`)
//       .join("\n\n");
//   } else if (summaryData?.summary) {
//     return summaryData.summary.join("\n- ");
//   }
//   return "";
// };

//   return (
//     <div className="p-6 max-w-4xl mx-auto space-y-6 relative">
//       {/* Tokens Left */}
//       {tokensLeft !== null && (
//         <div className="absolute top-4 right-6 text-sm bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded shadow-sm">
//           Tokens Left: {tokensLeft}
//         </div>
//       )}
//       <Button
//         variant="dark"
//         onClick={handleTryAgain}
//         className="inline-flex items-center gap-2 mb-4"
//       >
//         <ArrowLeft size={18} />
//         Back to Upload
//       </Button>
//       <div className="flex gap-3 mb-4 flex-wrap">
//   <Button variant="outline-primary" onClick={() => exportAsTxt(getFormattedSummaryText(), "summary")}>
//     <Download size={16} className="me-2" /> Export Summary (.txt)
//   </Button>
//   <Button variant="outline-success" onClick={() => exportAsPDF(getFormattedSummaryText(), "summary")}>
//     <Download size={16} className="me-2" /> Export Summary (.pdf)
//   </Button>
//   <Button variant="outline-secondary" onClick={() => copyToClipboard(getFormattedSummaryText())}>
//     <ClipboardCopy size={16} className="me-2" /> Copy Summary
//   </Button>
// </div>
//       <Card className="p-4 shadow-lg rounded-lg border border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100">
//         <h2 className="text-xl font-bold mb-4">📝 Summary</h2>

//         {summaryType === "meeting" && categorizedSummary ? (
//           Object.entries(categorizedSummary).map(([category, content], idx) => (
//             <div key={idx}>
//               <h3 className="text-lg font-semibold text-blue-700 mb-2">{category}</h3>
//               <p className="text-gray-800">{content}</p>
//             </div>
//           ))
//         ) : (
//           <ul className="list-disc list-inside text-gray-800">
//             {summaryData?.summary.map((point, index) => (
//               <li key={index}>{point}</li>
//             ))}
//           </ul>
//         )}
//       </Card>
//       <div className="flex gap-3 mt-4 flex-wrap">
//   <Button variant="outline-primary" onClick={() => exportAsTxt(transcript, "transcript")}>
//     <Download size={16} className="me-2" /> Export Transcript (.txt)
//   </Button>
//   <Button variant="outline-success" onClick={() => exportAsPDF(transcript, "transcript")}>
//     <Download size={16} className="me-2" /> Export Transcript (.pdf)
//   </Button>
//   <Button variant="outline-secondary" onClick={() => copyToClipboard(transcript)}>
//     <ClipboardCopy size={16} className="me-2" /> Copy Transcript
//   </Button>
// </div>
//       <div className="mt-6">
//         <h2 className="text-xl font-bold mb-2">📄 Transcript</h2>
//         <Button
//           variant="outline-secondary"
//           onClick={() => setShowTranscript(!showTranscript)}
//           className="mb-4"
//         >
//           {showTranscript ? "Hide Transcript" : "Show Transcript"}
//         </Button>

//         <CSSTransition
//           in={showTranscript}
//           timeout={500}
//           classNames="transcript"
//           unmountOnExit
//           nodeRef={transcriptRef}
//         >
//           <div
//             ref={transcriptRef}
//             className="bg-gray-100 p-4 rounded text-justify whitespace-pre-wrap transition-all"
//           >
//             {transcript}
//           </div>
//         </CSSTransition>
//       </div>

//       {/* Logout button */}
//       <Button
//         variant="danger"
//         onClick={() => {
//           localStorage.removeItem("token");
//           navigate("/home");
//         }}
//         className="w-full mt-6 py-2"
//       >
//         Logout
//       </Button>
//     </div>
//   );
// };

// export default Result;

// import React, { useEffect, useState, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { jsPDF } from "jspdf";
// import { ArrowLeft, ClipboardCopy, Download } from "lucide-react";
// import { Loader2 } from "lucide-react";
// import { Button, Card, Navbar, Container, Nav } from "react-bootstrap";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { CSSTransition } from "react-transition-group";
// import "./Result.css"; // Add custom CSS for animations

// const Result = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { transcriptId } = location.state || {};
//   const hasDeductedRef = useRef(false);
//   const task_id = transcriptId;

//   const [categorizedSummary, setCategorizedSummary] = useState(null);
//   const [actionItems, setActionItems] = useState([]);
//   const [transcript, setTranscript] = useState("");
//   const [summaryType, setSummaryType] = useState(null);
//   const [summaryData, setSummaryData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [tokenDeducted, setTokenDeducted] = useState(false);
//   const [tokensLeft, setTokensLeft] = useState(null);
//   const [showTranscript, setShowTranscript] = useState(false); // Manage transcript visibility
//   const [fromLocalStorage, setFromLocalStorage] = useState(false);

//   const transcriptRef = useRef(null);

//   const handleTryAgain = () => {
//     navigate("/home");
//   };

//   useEffect(() => {
//     const local = localStorage.getItem("summaryData");
//     if (local) {
//       const data = JSON.parse(local);
//       setFromLocalStorage(true);
//       setSummaryType(data.type);
//     }
//   }, []);

//   // Deduct token once summary is successfully returned
//   useEffect(() => {
//     const deductToken = async () => {
//       try {
//         const res = await fetch("http://127.0.0.1:8000/deduct-token", {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });

//         if (!res.ok) throw new Error("Token deduction failed");
//         const data = await res.json();
//         setTokensLeft(data.tokens_left);
//         setTokenDeducted(true);
//       } catch (err) {
//         console.error("Error deducting token:", err);
//         toast.error("Failed to deduct token.");
//       }
//     };

//     if ((summaryData || categorizedSummary) && !hasDeductedRef.current && !fromLocalStorage) {
//       hasDeductedRef.current = true;
//       deductToken();
//     }
//   }, [summaryData, categorizedSummary, fromLocalStorage]);

//   // Poll summary data
//   useEffect(() => {
//     let intervalId;
  
//     const fetchSummary = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/result/${task_id}`, {
//           method: "GET", // ✅ It should be GET for polling
//         });
//         const data = await response.json();
//         const result = data.data;
//         if (data.status === "completed") {
//           setSummaryType(result.type);
//           setTranscript(result.transcript);
  
//           if (result.type === "meeting") {
//             setCategorizedSummary(result.categorized_summary || {});
//             localStorage.setItem("summaryData", JSON.stringify({ type: result.type, categorized_summary: result.categorized_summary, transcript: result.transcript }));
//           } else {
//             setSummaryData({ summary: result.summary, transcript: result.transcript });
//             localStorage.setItem("summaryData", JSON.stringify({ type: result.type, summary: result.summary, transcript: result.transcript }));
//           }
  
//           clearInterval(intervalId); // ✅ Stop polling
//           setLoading(false);
//         } else if (data.status === "failed") {
//           toast.error("Summary generation failed.");
//           clearInterval(intervalId); // ✅ Stop polling
//           setLoading(false);
//         }
//       } catch (err) {
//         console.error("Polling error:", err);
//         toast.error("Something went wrong.");
//         clearInterval(intervalId); // ✅ Stop polling
//         setLoading(false);
//       }
//     };
  
//     if (transcriptId) {
//       fetchSummary(); // Immediate first fetch
//       intervalId = setInterval(fetchSummary, 4000); // Then poll every 4 seconds
//     } else {
//       toast.error("No transcript ID provided.");
//       setLoading(false);
//     }
  
//     return () => clearInterval(intervalId); // ✅ Cleanup on unmount
//   }, [transcriptId]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[70vh] text-center">
//         <Loader2 className="animate-spin text-blue-500 w-10 h-10 mb-4" />
//         <p className="text-lg">Processing your file... This may take a few seconds.</p>
//       </div>
//     );
//   }

//   if (!summaryData && !categorizedSummary) {
//     return (
//       <div className="text-center mt-20">
//         <p className="text-lg text-red-600 mb-4">Unable to load summary.</p>
//         <Button variant="dark" onClick={handleTryAgain} className="inline-flex items-center gap-2">
//           <ArrowLeft size={18} />
//           Try Again
//         </Button>
//       </div>
//     );
//   }

//   const exportAsTxt = (text, filename) => {
//     const blob = new Blob([text], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${filename}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const exportAsPDF = (text, filename) => {
//     const doc = new jsPDF();
//     const lines = doc.splitTextToSize(text, 180);
//     doc.text(lines, 10, 10);
//     doc.save(`${filename}.pdf`);
//   };

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text)
//       .then(() => toast.success("Copied to clipboard!"))
//       .catch(() => toast.error("Copy failed."));
//   };

//   const getFormattedSummaryText = () => {
//     if (summaryType === "meeting" && categorizedSummary) {
//       return Object.entries(categorizedSummary)
//         .map(([category, content]) => `${category.toUpperCase()}:\n${content}`)
//         .join("\n\n");
//     } else if (summaryData?.summary) {
//       return summaryData.summary.join("\n- ");
//     }
//     return "";
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
//       {/* Main Container */}
//       <div className="max-w-4xl mx-auto px-6 py-8 mt-20 space-y-8">
  
//         {/* Back Button */}
//         <Button
//           variant="dark"
//           onClick={handleTryAgain}
//           className="inline-flex items-center gap-2 text-white shadow-md"
//         >
//           <ArrowLeft size={18} />
//           Back to Upload
//         </Button>
  
//         {/* Summary Export Controls */}
//         <div className="flex flex-wrap gap-3">
//           <Button
//             variant="outline-primary"
//             onClick={() => exportAsTxt(getFormattedSummaryText(), "summary")}
//             size="sm"
//             className="shadow-sm"
//           >
//             <Download size={16} className="me-2" />
//             Export Summary (.txt)
//           </Button>
//           <Button
//             variant="outline-success"
//             onClick={() => exportAsPDF(getFormattedSummaryText(), "summary")}
//             size="sm"
//             className="shadow-sm"
//           >
//             <Download size={16} className="me-2" />
//             Export Summary (.pdf)
//           </Button>
//           <Button
//             variant="outline-secondary"
//             onClick={() => copyToClipboard(getFormattedSummaryText())}
//             size="sm"
//             className="shadow-sm"
//           >
//             <ClipboardCopy size={16} className="me-2" />
//             Copy Summary
//           </Button>
//         </div>
  
//         {/* Summary Section */}
//         <Card className="p-6 rounded-2xl shadow-xl border border-gray-200 bg-white">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Summary</h2>
  
//           {summaryType === "meeting" && categorizedSummary ? (
//             Object.entries(categorizedSummary).map(([category, content], idx) => (
//               <div key={idx} className="mb-4">
//                 <h3 className="text-lg font-semibold text-blue-700 mb-2">{category}</h3>
//                 <p className="text-gray-700">{content}</p>
//               </div>
//             ))
//           ) : (
//             <ul className="list-disc list-inside text-gray-800 space-y-1">
//               {summaryData?.summary.map((point, index) => (
//                 <li key={index}>{point}</li>
//               ))}
//             </ul>
//           )}
//         </Card>
  
//         {/* Transcript Export Controls */}
//         <div className="flex flex-wrap gap-3">
//           <Button
//             variant="outline-primary"
//             onClick={() => exportAsTxt(transcript, "transcript")}
//             size="sm"
//             className="shadow-sm"
//           >
//             <Download size={16} className="me-2" />
//             Export Transcript (.txt)
//           </Button>
//           <Button
//             variant="outline-success"
//             onClick={() => exportAsPDF(transcript, "transcript")}
//             size="sm"
//             className="shadow-sm"
//           >
//             <Download size={16} className="me-2" />
//             Export Transcript (.pdf)
//           </Button>
//           <Button
//             variant="outline-secondary"
//             onClick={() => copyToClipboard(transcript)}
//             size="sm"
//             className="shadow-sm"
//           >
//             <ClipboardCopy size={16} className="me-2" />
//             Copy Transcript
//           </Button>
//         </div>
  
//         {/* Transcript Toggle */}
//         <div className="mt-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">📄 Transcript</h2>
//           <Button
//             variant="outline-secondary"
//             onClick={() => setShowTranscript(!showTranscript)}
//             className="mb-4"
//           >
//             {showTranscript ? "Hide Transcript" : "Show Transcript"}
//           </Button>
  
//           <CSSTransition
//             in={showTranscript}
//             timeout={500}
//             classNames="transcript"
//             unmountOnExit
//             nodeRef={transcriptRef}
//           >
//             <div
//               ref={transcriptRef}
//               className="bg-white p-4 rounded-xl shadow-md text-justify whitespace-pre-wrap transition-all border border-gray-200"
//             >
//               {transcript}
//             </div>
//           </CSSTransition>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default Result;
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import { ArrowLeft, ClipboardCopy, Download, LogOut } from "lucide-react"; // Added LogOut
import { Loader2 } from "lucide-react";
import { Button, Card, Navbar, Container, Nav } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import { CSSTransition } from "react-transition-group";
import "./Result.css"; // Add custom CSS for animations

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { transcriptId } = location.state || {};
  const hasDeductedRef = useRef(false);
  const task_id = transcriptId;

  const [categorizedSummary, setCategorizedSummary] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [summaryType, setSummaryType] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenDeducted, setTokenDeducted] = useState(false);
  const [tokensLeft, setTokensLeft] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false); // Manage transcript visibility
  const [fromLocalStorage, setFromLocalStorage] = useState(false);

  const transcriptRef = useRef(null);

  const handleTryAgain = () => {
    navigate("/home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // Or wherever you want to redirect the user after logout
  };

  useEffect(() => {
    const local = localStorage.getItem("summaryData");
    if (local) {
      const data = JSON.parse(local);
      setFromLocalStorage(true);
      setSummaryType(data.type);
    }
  }, []);

  // Deduct token once summary is successfully returned
  useEffect(() => {
    const deductToken = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/deduct-token", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Token deduction failed");
        const data = await res.json();
        setTokensLeft(data.tokens_left);
        setTokenDeducted(true);
      } catch (err) {
        console.error("Error deducting token:", err);
        toast.error("Failed to deduct token.");
      }
    };

    if ((summaryData || categorizedSummary) && !hasDeductedRef.current && !fromLocalStorage) {
      hasDeductedRef.current = true;
      deductToken();
    }
  }, [summaryData, categorizedSummary, fromLocalStorage]);

  // Poll summary data
  useEffect(() => {
    let intervalId;

    const fetchSummary = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/result/${task_id}`, {
          method: "GET", // ✅ It should be GET for polling
        });
        const data = await response.json();
        const result = data.data;
        if (data.status === "completed") {
          setSummaryType(result.type);
          setTranscript(result.transcript);

          if (result.type === "meeting") {
            setCategorizedSummary(result.categorized_summary || {});
            localStorage.setItem("summaryData", JSON.stringify({ type: result.type, categorized_summary: result.categorized_summary, transcript: result.transcript }));
          } else {
            setSummaryData({ summary: result.summary, transcript: result.transcript });
            localStorage.setItem("summaryData", JSON.stringify({ type: result.type, summary: result.summary, transcript: result.transcript }));
          }

          clearInterval(intervalId); // ✅ Stop polling
          setLoading(false);
        } else if (data.status === "failed") {
          toast.error("Summary generation failed.");
          clearInterval(intervalId); // ✅ Stop polling
          setLoading(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        toast.error("Something went wrong.");
        clearInterval(intervalId); // ✅ Stop polling
        setLoading(false);
      }
    };

    if (transcriptId) {
      fetchSummary(); // Immediate first fetch
      intervalId = setInterval(fetchSummary, 4000); // Then poll every 4 seconds
    } else {
      toast.error("No transcript ID provided.");
      setLoading(false);
    }

    return () => clearInterval(intervalId); // ✅ Cleanup on unmount
  }, [transcriptId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10 mb-4" />
        <p className="text-lg">Processing your file... This may take a few seconds.</p>
      </div>
    );
  }

  if (!summaryData && !categorizedSummary) {
    return (
      <div className="text-center mt-20">
        <p className="text-lg text-red-600 mb-4">Unable to load summary.</p>
        <Button variant="dark" onClick={handleTryAgain} className="inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Try Again
        </Button>
      </div>
    );
  }

  const exportAsTxt = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = (text, filename) => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 10, 10);
    doc.save(`${filename}.pdf`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Copy failed."));
  };

  const getFormattedSummaryText = () => {
    if (summaryType === "meeting" && categorizedSummary) {
      return Object.entries(categorizedSummary)
        .map(([category, content]) => `${category.toUpperCase()}:\n${content}`)
        .join("\n\n");
    } else if (summaryData?.summary) {
      return summaryData.summary.join("\n- ");
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
    {/* Main Container */}
    <div className="max-w-4xl mx-auto px-6 py-8 mt-10 space-y-8">
      {/* Tokens + Logout Row */}
      <div className="flex justify-end items-center space-x-4 mb-4">
        <div className="text-lg font-semibold">{tokensLeft} Credits </div>
        <Button
          variant="outline-danger"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut size={18} /> Log Out
        </Button>
      </div>

      {/* Back Button */}
      <Button
        variant="dark"
        onClick={handleTryAgain}
        className="inline-flex items-center gap-2 text-white shadow-md"
      >
        <ArrowLeft size={18} />
        Back to Upload
      </Button>

        {/* Summary Export Controls */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline-primary"
            onClick={() => exportAsTxt(getFormattedSummaryText(), "summary")}
            size="sm"
            className="shadow-sm"
          >
            <Download size={16} className="me-2" />
            Export Summary (.txt)
          </Button>
          <Button
            variant="outline-success"
            onClick={() => exportAsPDF(getFormattedSummaryText(), "summary")}
            size="sm"
            className="shadow-sm"
          >
            <Download size={16} className="me-2" />
            Export Summary (.pdf)
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => copyToClipboard(getFormattedSummaryText())}
            size="sm"
            className="shadow-sm"
          >
            <ClipboardCopy size={16} className="me-2" />
            Copy Summary
          </Button>
        </div>

        {/* Summary Section */}
        <Card className="p-6 rounded-2xl shadow-xl border border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Summary</h2>

          {summaryType === "meeting" && categorizedSummary ? (
            Object.entries(categorizedSummary).map(([category, content], idx) => (
              <div key={idx} className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">{category}</h3>
                <p className="text-gray-700">{content}</p>
              </div>
            ))
          ) : (
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {summaryData?.summary.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          )}
        </Card>

        Transcript Export Controls
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline-primary"
            onClick={() => exportAsTxt(transcript, "transcript")}
          size="sm"
            className="shadow-sm"
          >
           <Download size={16} className="me-2" />
            Export Transcript (.txt)
         </Button>
          <Button
            variant="outline-success"
             onClick={() => exportAsPDF(transcript, "transcript")}
             size="sm"
             className="shadow-sm"
           >
             <Download size={16} className="me-2" />
             Export Transcript (.pdf)
           </Button>
           <Button
             variant="outline-secondary"
             onClick={() => copyToClipboard(transcript)}
             size="sm"
             className="shadow-sm"
           >
             <ClipboardCopy size={16} className="me-2" />
             Copy Transcript
           </Button>
         </div>
  
         {/* Transcript Toggle */}
         <div className="mt-6">
           <h2 className="text-2xl font-bold text-gray-800 mb-2">📄 Transcript</h2>
           <Button
             variant="outline-secondary"
             onClick={() => setShowTranscript(!showTranscript)}
             className="mb-4"
           >
            {showTranscript ? "Hide Transcript" : "Show Transcript"}
           </Button>
  
           <CSSTransition
             in={showTranscript}
             timeout={500}
             classNames="transcript"
             unmountOnExit
             nodeRef={transcriptRef}
           >
             <div
               ref={transcriptRef}
               className="bg-white p-4 rounded-xl shadow-md text-justify whitespace-pre-wrap transition-all border border-gray-200"
             >
               {transcript}
             </div>
           </CSSTransition>
      </div>
    </div>
    </div>
  );
};

export default Result;
