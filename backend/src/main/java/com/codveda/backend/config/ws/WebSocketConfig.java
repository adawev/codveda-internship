package com.codveda.backend.config.ws;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthChannelInterceptor authChannelInterceptor;
    private final String[] allowedOrigins;
    private final boolean relayEnabled;
    private final String relayHost;
    private final Integer relayPort;
    private final String relayClientLogin;
    private final String relayClientPasscode;
    private final String relaySystemLogin;
    private final String relaySystemPasscode;

    public WebSocketConfig(
            WebSocketAuthChannelInterceptor authChannelInterceptor,
            @Value("${app.cors.allowed-origins:http://localhost:3000}") String allowedOrigins,
            @Value("${app.websocket.broker.relay-enabled:false}") boolean relayEnabled,
            @Value("${app.websocket.broker.relay-host:localhost}") String relayHost,
            @Value("${app.websocket.broker.relay-port:61613}") Integer relayPort,
            @Value("${app.websocket.broker.client-login:guest}") String relayClientLogin,
            @Value("${app.websocket.broker.client-passcode:guest}") String relayClientPasscode,
            @Value("${app.websocket.broker.system-login:guest}") String relaySystemLogin,
            @Value("${app.websocket.broker.system-passcode:guest}") String relaySystemPasscode
    ) {
        this.authChannelInterceptor = authChannelInterceptor;
        this.allowedOrigins = allowedOrigins == null ? new String[0] : allowedOrigins.split(",");
        this.relayEnabled = relayEnabled;
        this.relayHost = relayHost;
        this.relayPort = relayPort;
        this.relayClientLogin = relayClientLogin;
        this.relayClientPasscode = relayClientPasscode;
        this.relaySystemLogin = relaySystemLogin;
        this.relaySystemPasscode = relaySystemPasscode;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        if (relayEnabled) {
            config.enableStompBrokerRelay("/topic")
                    .setRelayHost(relayHost)
                    .setRelayPort(relayPort)
                    .setClientLogin(relayClientLogin)
                    .setClientPasscode(relayClientPasscode)
                    .setSystemLogin(relaySystemLogin)
                    .setSystemPasscode(relaySystemPasscode);
        } else {
            config.enableSimpleBroker("/topic");
        }
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(normalizeAllowedOrigins())
                .withSockJS();

        registry.addEndpoint("/ws-simple")
                .setAllowedOrigins(normalizeAllowedOrigins());
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(authChannelInterceptor);
    }

    private String[] normalizeAllowedOrigins() {
        return java.util.Arrays.stream(allowedOrigins)
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toArray(String[]::new);
    }
}
