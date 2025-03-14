import axios from "axios";
import React, { useRef, useState, useEffect } from "react";

const YouTubeStreamer = () => {
  const mediaRecorderRef = useRef(null);  // MediaRecorder instance reference
  const intervalRef = useRef(null);       // Interval reference for chunk uploads
  const [isRecording, setIsRecording] = useState(false);
  const [captions, setCaptions] = useState("");
  const isUploadingRef = useRef(false);   // Prevents multiple uploads
  const lastCaptionRef = useRef("");      // Tracks the last displayed caption

  // ✅ Continuously fetch captions when recording is active
  useEffect(() => {
    if (isRecording) {
      const captionInterval = setInterval(fetchCaptions, 500); // Poll captions every 500ms
      return () => clearInterval(captionInterval); // Cleanup on stop
    }
  }, [isRecording]);

  // ✅ Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 15, max: 30 } } // Optimal frame rate
      });

      setIsRecording(true);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
      let recordedChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`🎥 Chunk recorded (Size: ${event.data.size} bytes)`);
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (recordedChunks.length > 0 && !isUploadingRef.current) {
          isUploadingRef.current = true;

          const blob = new Blob(recordedChunks, { type: "video/webm" });
          await sendVideoChunk(blob);

          recordedChunks = [];
          isUploadingRef.current = false;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      // Create continuous chunks every 2 seconds
      intervalRef.current = setInterval(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          mediaRecorder.start();
        }
      }, 2000);

    } catch (error) {
      console.error("❌ Error starting recording:", error);
    }
  };

  // ✅ Stop Recording
  const stopRecording = () => {
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    clearInterval(intervalRef.current);
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
  };

  // ✅ Upload Video Chunk with Retry Logic
  const sendVideoChunk = async (videoChunk) => {
    console.log(`➡️ Sending video chunk (Size: ${videoChunk.size} bytes)`);

    const formData = new FormData();
    formData.append("video", videoChunk, `chunk-${Date.now()}.webm`);

    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
        const response = await axios.post("http://localhost:5000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(`✅ Chunk uploaded successfully: ${response.data.message}`);
        break;
      } catch (error) {
        console.error(`❌ Error uploading chunk (Attempt ${attempts + 1}):`, error);
        attempts++;
      }
    }
  };

  // ✅ Fetch Captions
  const fetchCaptions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/captions");

      const newCaptions = response.data.captions;
      if (newCaptions && Array.isArray(newCaptions) && newCaptions.length > 0) {
        const latestCaption = newCaptions[newCaptions.length - 1].caption;
        console.log(latestCaption);

        if (latestCaption !== lastCaptionRef.current) {
          lastCaptionRef.current = latestCaption;
          setCaptions(latestCaption);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching captions:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-xl font-bold mb-4">YouTube Stream Recorder</h2>
      <p className="text-sm mb-4">Open the YouTube video in another tab for recording.</p>

      <div className="mt-4 flex gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Stop Recording
          </button>
        )}
      </div>

      Display Captions
      {captions && (() => {
  // Extract JSON from the string
  const jsonMatch = captions.match(/```json([\s\S]*?)```/);
  
  if (!jsonMatch) return <p className="text-red-500">❌ Invalid caption format</p>;

  try {
    const parsedData = JSON.parse(jsonMatch[1].trim());

    return (
      <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg shadow-lg text-lg space-y-2">
        <div>
          <strong>🚨 Alert Detected:</strong> 
          {parsedData.is_alert_detected ? " Yes" : " No"}
        </div>

        {parsedData.alert_description && (
          <div>
            <strong>📝 Alert Description:</strong> {parsedData.alert_description}
          </div>
        )}

        <div>
          <strong>🎮 Video Background:</strong> {parsedData.video_background}
        </div>

        <div>
          <strong>📹 Video Foreground:</strong> {parsedData.video_foreground}
        </div>

        <div>
          <strong>🧑‍🤝‍🧑 People in Video:</strong> {parsedData["people in the video"]}
        </div>

        <div>
          <strong>📋 Video Summary:</strong> {parsedData.video_summary}
        </div>
      </div>
    );
  } catch (error) {
    return <p className="text-red-500">❌ Error parsing captions</p>;
  }
})()}


    </div>
  );
};

export default YouTubeStreamer;
