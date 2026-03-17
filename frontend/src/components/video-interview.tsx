'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Circle, Square } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface VideoInterviewProps {
  roomId: string;
  userId: string;
  userType: 'student' | 'admin';
  onEndInterview: () => void;
  onRecordingComplete?: (blob: Blob, duration: number) => void;
}

export function VideoInterview({
  roomId,
  userId,
  userType,
  onEndInterview,
  onRecordingComplete,
}: VideoInterviewProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const recordingStartTimeRef = useRef<number>(0);

  useEffect(() => {
    initializeWebRTC();
    return () => {
      cleanup();
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Connect to signaling server
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const hostname = window.location.hostname;
      const port = window.location.port;
      const wsUrl = port
        ? `${protocol}//${hostname}:${port === '3012' ? '3013' : port}`
        : `${protocol}//${hostname}`;

      const socket = io(`${wsUrl}/webrtc`, {
        transports: ['websocket'],
      });

      socketRef.current = socket;
      setIsConnected(true);

      socket.on('connect', () => {
        console.log('Connected to signaling server');
        socket.emit('join-room', { roomId, userId, userType });
      });

      socket.on('peer-joined', async (data: { peerId: string }) => {
        console.log('Peer joined:', data.peerId);
        await createOffer(data.peerId);
      });

      socket.on('existing-peers', async (peers: Array<{ peerId: string }>) => {
        console.log('Existing peers:', peers);
        for (const peer of peers) {
          await createOffer(peer.peerId);
        }
      });

      socket.on('offer', async (data: { offer: RTCSessionDescriptionInit; fromPeerId: string }) => {
        await handleOffer(data.offer, data.fromPeerId);
      });

      socket.on('answer', async (data: { answer: RTCSessionDescriptionInit; fromPeerId: string }) => {
        await handleAnswer(data.answer);
      });

      socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit; fromPeerId: string }) => {
        await handleIceCandidate(data.candidate);
      });

      socket.on('peer-left', () => {
        console.log('Peer left');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      };

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socket.emit('ice-candidate', {
            roomId,
            candidate: event.candidate,
            targetPeerId: 'broadcast', // Send to all peers in room
          });
        }
      };
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const createOffer = async (targetPeerId: string) => {
    if (!peerConnectionRef.current || !socketRef.current) return;

    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socketRef.current.emit('offer', {
        roomId,
        offer,
        targetPeerId,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, fromPeerId: string) => {
    if (!peerConnectionRef.current || !socketRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socketRef.current.emit('answer', {
        roomId,
        answer,
        targetPeerId: fromPeerId,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const startRecording = () => {
    if (!localStreamRef.current) return;

    const mediaRecorder = new MediaRecorder(localStreamRef.current, {
      mimeType: 'video/webm;codecs=vp8,opus',
    });

    recordedChunksRef.current = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
      if (onRecordingComplete) {
        onRecordingComplete(blob, duration);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    recordingStartTimeRef.current = Date.now();

    // Update duration every second
    const interval = setInterval(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        setRecordingDuration((Date.now() - recordingStartTimeRef.current) / 1000);
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId });
      socketRef.current.disconnect();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Video Interview</CardTitle>
        <CardDescription>
          Room: {roomId} | {isConnected ? 'Connected' : 'Connecting...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Local Video */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              You ({userType})
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <VideoOff className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Remote Video */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {userType === 'student' ? 'Interviewer' : 'Student'}
            </div>
            {!remoteVideoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <p className="text-gray-400">Waiting for peer to join...</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button
            variant={isVideoEnabled ? 'default' : 'destructive'}
            onClick={toggleVideo}
            size="lg"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isAudioEnabled ? 'default' : 'destructive'}
            onClick={toggleAudio}
            size="lg"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          {userType === 'admin' && (
            <>
              {!isRecording ? (
                <Button onClick={startRecording} variant="destructive" size="lg">
                  <Circle className="h-5 w-5 mr-2 fill-current" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" size="lg">
                  <Square className="h-5 w-5 mr-2" />
                  Stop ({formatDuration(recordingDuration)})
                </Button>
              )}
            </>
          )}

          <Button onClick={onEndInterview} variant="outline" size="lg">
            <PhoneOff className="h-5 w-5 mr-2" />
            End Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

