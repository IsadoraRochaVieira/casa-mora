import { Conversation } from "https://esm.sh/@elevenlabs/client@1.7.0";

export class LiveConversation {
  constructor({ signedUrl, onStatus, onTranscript, onTurn }) {
    this.signedUrl = signedUrl;
    this.onStatus = onStatus;
    this.onTranscript = onTranscript;
    this.onTurn = onTurn;
    this.lastMessage = { user: "", assistant: "" };
    this.savedMessage = { user: "", assistant: "" };
  }

  async start() {
    this.session = await Conversation.startSession({
      signedUrl: this.signedUrl,
      connectionType: "websocket",
      onConnect: () => this.onStatus("Ouvindo…"),
      onStatusChange: ({ status }) => {
        if (status === "connecting") this.onStatus("Conectando à voz…");
        if (status === "disconnected" && !this.stopping) this.onStatus("A conexão de voz foi encerrada.");
      },
      onModeChange: ({ mode }) => {
        if (mode === "speaking") {
          this.saveLatest("user");
          this.playResponseCue();
          this.onStatus("Júlia está falando…");
        } else {
          this.saveLatest("assistant");
          this.onStatus("Ouvindo…");
        }
      },
      onMessage: ({ source, message }) => {
        const role = source === "ai" ? "assistant" : "user";
        const text = String(message || "").trim();
        if (!text) return;
        this.lastMessage[role] = text;
        this.onTranscript(text, role);
      },
      onError: (error) => {
        console.error("ElevenLabs voice error", error);
        this.onStatus("Não foi possível manter a conversa por voz.");
      }
    });
    this.sessionTimer = setTimeout(() => this.stop(), 15 * 60 * 1000);
  }

  saveLatest(role) {
    const text = this.lastMessage[role];
    if (text && text !== this.savedMessage[role]) {
      this.savedMessage[role] = text;
      this.onTurn(role, text);
    }
  }

  playResponseCue() {
    try {
      const context = new AudioContext();
      [660, 880].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + index * .075;
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(.0001, start);
        gain.gain.exponentialRampToValueAtTime(.09, start + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, start + .09);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + .1);
      });
      setTimeout(() => context.close(), 500);
    } catch {}
  }

  stop() {
    this.stopping = true;
    clearTimeout(this.sessionTimer);
    this.saveLatest("user");
    this.saveLatest("assistant");
    this.session?.endSession();
    this.onStatus("Conversa encerrada");
  }
}
