import { connectStomp, disconnectStomp } from "./stomp";

describe("stomp reconnect behavior", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    disconnectStomp();
    jest.useRealTimers();
    delete global.WebSocket;
  });

  test("reconnects after unexpected socket close", () => {
    const sockets = [];
    global.WebSocket = jest.fn().mockImplementation(() => {
      const socket = {
        readyState: 1,
        send: jest.fn(),
        close: jest.fn(),
      };
      sockets.push(socket);
      return socket;
    });

    connectStomp("access-token", {});
    expect(global.WebSocket).toHaveBeenCalledTimes(1);

    sockets[0].onclose?.();
    jest.advanceTimersByTime(1000);

    expect(global.WebSocket).toHaveBeenCalledTimes(2);
  });
});
