
import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";

interface VoiceRecorderProps {
  onRecord: (blob: Blob, fileName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceRecorder = ({ onRecord, isOpen, onClose }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Set up audio element
  useEffect(() => {
    audioRef.current = new Audio(audioUrl || "");
    
    const handleEnded = () => setIsPlaying(false);
    audioRef.current.addEventListener("ended", handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleEnded);
      }
    };
  }, [audioUrl]);
  
  // Clean up when dialog closes
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setAudioUrl(null);
      setRecordingTime(0);
    }
  }, [isOpen]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds += 1;
        setRecordingTime(seconds);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error("Could not access your microphone. Please check permissions.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const handleSave = () => {
    if (audioChunksRef.current.length === 0) return;
    
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
    const fileName = `voice_recording_${new Date().toISOString()}.mp3`;
    onRecord(audioBlob, fileName);
    onClose();
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Voice</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="text-3xl font-mono">
            {formatTime(recordingTime)}
          </div>
          
          <div className="space-x-4">
            {!isRecording && !audioUrl && (
              <Button 
                onClick={startRecording}
                variant="outline"
                className="rounded-full h-14 w-14"
              >
                <Mic className="h-6 w-6 text-red-500" />
              </Button>
            )}
            
            {isRecording && (
              <Button 
                onClick={stopRecording}
                variant="outline"
                className="rounded-full h-14 w-14"
              >
                <Square className="h-6 w-6 text-red-500" />
              </Button>
            )}
            
            {audioUrl && (
              <Button 
                onClick={togglePlayback}
                variant="outline"
                className="rounded-full h-14 w-14"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!audioUrl}
          >
            Save Recording
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
