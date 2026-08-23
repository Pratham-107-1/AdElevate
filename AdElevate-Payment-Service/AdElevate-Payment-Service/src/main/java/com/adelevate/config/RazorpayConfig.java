package com.adelevate.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key}")
    private String key;

    @Value("${razorpay.secret}")
    private String secret;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        return new RazorpayClient(key, secret);
    }

    @Bean
    public String razorpaySecret() {
        return secret; // ✅ expose secret for signature verification
    }

    // ✅ Expose the key_id (public, safe to send to the frontend) so the
    // frontend never hardcodes its own copy that can drift out of sync
    // with the backend's key. Only the key_id is exposed here — never
    // the secret.
    @Bean
    public String razorpayKey() {
        return key;
    }
}
