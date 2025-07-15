"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Utensils, MapPin, Dumbbell, Mic } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useRef, useState } from "react";

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleMicClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          console.log("🎙️ Audio blob ready:", audioBlob);
          // TODO: Send to OpenAI Whisper later
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("🎤 Mic access denied or error:", err);
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };


  const handleSelect = (id: number) => {
    const newUrl = `?id=${id}`;
    router.push(newUrl);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Select a Practice Scenario
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => {
          const isSelected = scenario.id === selectedId;

          return (
            <Card
              key={scenario.title}
              className={`cursor-pointer transition-shadow ${
                isSelected
                  ? "border-2 border-primary shadow-xl"
                  : "hover:shadow-lg"
              }`}
              onClick={() => handleSelect(scenario.id)}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                {scenario.icon}
                <CardTitle>{scenario.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{scenario.description}</p>
              </CardContent>
            </Card>
          );
        })}

        {selectedId ? (
          <>
          <div className="hidden lg:block col-span-1"></div>
          <Card className="col-span-1 flex items-center justify-center p-6 border-dashed border-2 border-muted-foreground">
            <button
              onClick={handleMicClick}
              className={`flex flex-col items-center justify-center gap-2 transition-colors ${
                isRecording ? "text-red-500 animate-pulse" : "text-primary hover:text-primary/80"
              }`}
            >
              <Mic className="w-12 h-12" />
              <span className="font-semibold">
                {isRecording ? "Listening..." : "Start Conversation"}
              </span>
            </button>
          </Card>
          </>
        ): <div>No scenario selected</div>}
      </div>
    </div>
  );
}
