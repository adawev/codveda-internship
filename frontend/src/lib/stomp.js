import { API_BASE_URL } from "../services/api";

const FRAME_TERMINATOR = "\u0000";

const buildWsUrl = () => {
  const normalized = API_BASE_URL.replace(/\/$/, "");
  const parsed = new URL(normalized);
  const scheme = parsed.protocol === "https:" ? "wss" : "ws";
  const host = parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname;
  return `${scheme}://${host}/ws-simple`;
};

const parseFrame = (rawFrame) => {
  const lines = rawFrame.split("\n");
  const command = lines.shift().trim();
  const headers = {};
  let line;
  while (lines.length) {
    line = lines.shift();
    if (line === "") {
      break;
    }
    const [key, value] = line.split(":", 2);
    headers[key] = value ?? "";
  }
  const body = lines.join("\n");
  return { command, headers, body };
};

class StompSession {
  constructor(accessToken, handlers = {}) {
    this.accessToken = accessToken;
    this.handlers = handlers;
    this.subscriptions = new Map();
    this.pendingSubscriptions = [];
    this.nextSubscriptionId = 1;
    this.buffer = "";
    this.connected = false;
    this.socket = null;
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(buildWsUrl());
    this.socket.onopen = () => this.sendFrame("CONNECT", {
      Authorization: `Bearer ${this.accessToken}`,
      "accept-version": "1.2",
      "heart-beat": "0,0",
    });
    this.socket.onmessage = (event) => this.handleSocketMessage(event.data);
    this.socket.onerror = (event) => this.handlers.onError?.(event);
    this.socket.onclose = () => this.handleDisconnect();
  }

  handleDisconnect() {
    this.connected = false;
    this.socket = null;
    this.handlers.onDisconnect?.();
  }

  handleSocketMessage(payload) {
    this.buffer += payload;
    let boundary;
    while ((boundary = this.buffer.indexOf(FRAME_TERMINATOR)) !== -1) {
      const rawFrame = this.buffer.slice(0, boundary);
      this.buffer = this.buffer.slice(boundary + 1);
      if (!rawFrame.trim()) {
        continue;
      }
      const frame = parseFrame(rawFrame);
      this.handleFrame(frame);
    }
  }

  handleFrame(frame) {
    if (frame.command === "CONNECTED") {
      this.connected = true;
      this.handlers.onConnect?.();
      this.flushPendingSubscriptions();
      return;
    }

    if (frame.command === "MESSAGE") {
      const subscriptionId = frame.headers.subscription;
      const callback = this.subscriptions.get(subscriptionId);
      if (callback) {
        try {
          const parsed = JSON.parse(frame.body);
          callback(parsed);
        } catch (error) {
          console.error("WebSocket: failed to parse message payload", error);
        }
      }
      return;
    }

    if (frame.command === "ERROR") {
      this.handlers.onError?.(frame);
    }
  }

  flushPendingSubscriptions() {
    this.pendingSubscriptions.forEach((sendFn) => sendFn());
    this.pendingSubscriptions = [];
  }

  sendFrame(command, headers = {}, body = "") {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
    const frame = `${command}\n${headerLines.join("\n")}\n\n${body}${FRAME_TERMINATOR}`;
    this.socket.send(frame);
  }

  subscribe(destination, callback) {
    if (!destination || typeof callback !== "function") {
      return null;
    }

    const id = `sub-${this.nextSubscriptionId++}`;
    this.subscriptions.set(id, callback);
    const sendSubscription = () => this.sendFrame("SUBSCRIBE", { id, destination });

    if (this.connected) {
      sendSubscription();
    } else {
      this.pendingSubscriptions.push(sendSubscription);
    }

    return {
      id,
      unsubscribe: () => this.unsubscribe(id),
    };
  }

  unsubscribe(id) {
    if (!this.subscriptions.has(id)) {
      return;
    }
    this.subscriptions.delete(id);
    if (this.connected) {
      this.sendFrame("UNSUBSCRIBE", { id });
    }
  }

  isConnected() {
    return this.connected;
  }

  disconnect() {
    if (this.socket) {
      this.sendFrame("DISCONNECT");
      this.socket.close();
    }
    this.connected = false;
    this.subscriptions.clear();
    this.pendingSubscriptions = [];
  }
}

let stompSession = null;

export const connectStomp = (accessToken, handlers = {}) => {
  if (!accessToken) {
    return null;
  }

  if (stompSession && stompSession.isConnected() && stompSession.accessToken === accessToken) {
    handlers.onConnect?.(stompSession);
    return stompSession;
  }

  stompSession?.disconnect();
  stompSession = new StompSession(accessToken, handlers);
  return stompSession;
};

export const subscribeStomp = (destination, callback) => {
  if (!stompSession) {
    return null;
  }
  return stompSession.subscribe(destination, callback);
};

export const disconnectStomp = () => {
  stompSession?.disconnect();
  stompSession = null;
};
