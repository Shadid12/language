"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Utensils, MapPin, Dumbbell, Mic } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const scenarios = [
  {
    id: 1,
    title: "At a Restaurant",
    description:
      "Learn how to order food, ask for recommendations, and handle the bill in a restaurant setting.",
    icon: <Utensils className="h-8 w-8 text-primary" />,
  },
  {
    id: 2,
    title: "Asking for Directions",
    description:
      "Practice common phrases for finding your way around a new city or asking locals for help.",
    icon: <MapPin className="h-8 w-8 text-primary" />,
  },
  {
    id: 3,
    title: "At the Gym",
    description:
      "Explore vocabulary related to workouts, equipment, and speaking with trainers.",
    icon: <Dumbbell className="h-8 w-8 text-primary" />,
  },
];

export default function LanguageScenariosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = parseInt(searchParams.get("id") || "");

  const [isRecording, setIsRecording] = useState(false);

  const [messages, setMessages] = useState<string[]>([]);
  const addMsg = (t: string) => setMessages((p) => [...p, t.trim()]);

  // Refs we need to reuse / clean up
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  /** Disconnect & release resources */
  const stopConversation = useCallback(() => {
    setIsRecording(false);

    pcRef.current?.close();
    pcRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
  }, []);

  /** Main entry point – runs when mic button is pressed */
  const handleMicClick = async () => {
    if (isRecording) return stopConversation(); // toggle‑off

    try {
      // 1. Get an ephemeral key from our Next.js API route
      const tokenRes = await fetch(`/api/session?id=${selectedId}`);
      if (!tokenRes.ok) throw new Error("Could not fetch session token");
      const { client_secret } = await tokenRes.json();
      const EPHEMERAL_KEY = client_secret.value as string;

      // 2. Prepare local mic
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = localStream;

      // 3. Create & configure PeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Play remote audio
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.autoplay = true;
      }
      pc.ontrack = (e) => {
        if (audioRef.current) audioRef.current.srcObject = e.streams[0];
      };

      // Local audio → peer
      pc.addTrack(localStream.getAudioTracks()[0]);

      // 4. Optional: Data channel for events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
            dc.onmessage = (e) => {
        try {
          const evt = JSON.parse(e.data);
          if (evt.type === "assistant" && evt.text) addMsg(evt.text);
        } catch {
          addMsg(e.data as string);
        }
      };

      // 5. Offer / answer exchange
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2025-06-03";
      const sdpRes = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpRes.ok) throw new Error("OpenAI SDP exchange failed");

      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: await sdpRes.text(),
      };
      await pc.setRemoteDescription(answer);

      setMessages([]); 
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      stopConversation();
      alert("Failed to start conversation – check console for details.");
    }
  };

  /** Clean up when component unmounts */
  useEffect(() => stopConversation, [stopConversation]);

  const handleSelect = (id: number) => router.push(`?id=${id}`);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Select a Practice Scenario
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((s) => {
          const isSel = s.id === selectedId;
          return (
            <Card
              key={s.title}
              onClick={() => handleSelect(s.id)}
              className={`cursor-pointer transition-shadow ${
                isSel ? "border-2 border-primary shadow-xl" : "hover:shadow-lg"
              }`}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                {s.icon}
                <CardTitle>{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{s.description}</p>
              </CardContent>
            </Card>
          );
        })}

        {selectedId ? (
          <>
            <div className="hidden lg:block col-span-1" />
            <Card className="col-span-1 flex items-center justify-center p-6 border-dashed border-2 border-muted-foreground">
              <button
                onClick={handleMicClick}
                className={`flex flex-col items-center justify-center gap-2 transition-colors ${
                  isRecording
                    ? "text-red-500 animate-pulse"
                    : "text-primary hover:text-primary/80"
                }`}
              >
                <Mic className="w-12 h-12" />
                <span className="font-semibold">
                  {isRecording ? "Listening…" : "Start Conversation"}
                </span>
              </button>
            </Card>
          </>
        ) : (
          <div>No scenario selected</div>
        )}
      </div>
    </div>
  );
}
