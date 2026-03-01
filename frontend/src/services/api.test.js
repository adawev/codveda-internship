const mockApiInstance = {
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

const mockAxiosPost = jest.fn();

jest.mock("axios", () => ({
  create: jest.fn(() => mockApiInstance),
  post: (...args) => mockAxiosPost(...args),
}));

const mockEmitToast = jest.fn();
jest.mock("../components/toast/toastBus", () => ({
  emitToast: (...args) => mockEmitToast(...args),
}));

describe("API interceptor expired session flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test("clears session and emits warning when refresh fails after 401", async () => {
    const listeners = [];
    const addSpy = jest.spyOn(window, "addEventListener");
    const removeSpy = jest.spyOn(window, "removeEventListener");
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    addSpy.mockImplementation((name, cb) => {
      if (name === "auth:logout") {
        listeners.push(cb);
      }
    });
    removeSpy.mockImplementation(() => {});

    const { setAccessToken } = require("./api");
    setAccessToken("active-access-token");

    const [, errorHandler] = mockApiInstance.interceptors.response.use.mock.calls[0];
    const refreshError = new Error("refresh failed");
    mockAxiosPost.mockRejectedValueOnce(refreshError);

    const apiError = {
      config: { url: "/api/users/me", headers: {} },
      response: { status: 401, data: { message: "Unauthorized" } },
    };

    await expect(errorHandler(apiError)).rejects.toBe(refreshError);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "auth:logout" }));
    expect(mockEmitToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Session expired",
      variant: "warning",
    }));

    addSpy.mockRestore();
    removeSpy.mockRestore();
    dispatchSpy.mockRestore();
  });
});
