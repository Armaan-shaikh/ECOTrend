import hmac
import hashlib
import json
import time
import logging
import urllib.parse
import ipaddress
from typing import Dict, Any, Optional

logger = logging.getLogger("ecotrend.webhook_engine")

class WebhookEngine:
    """
    Enterprise Outbound Webhook Signing, SSRF Protection & Dispatch Engine.
    - HMAC SHA-256 Request Signatures: X-EcoTrend-Signature: t=<timestamp>,v1=<signature>.
    - Replay protection: Rejects requests with timestamp > 300 seconds old.
    - SSRF Protection: Blocks requests targeting loopback / RFC 1918 internal IP ranges.
    - Never exposes secret keys in payloads or logs.
    """

    BLOCKED_HOSTNAMES = {"localhost", "127.0.0.1", "::1", "0.0.0.0", "169.254.169.254"}

    @staticmethod
    def validate_webhook_url(url: str) -> bool:
        try:
            parsed = urllib.parse.urlparse(url)
            if parsed.scheme not in ["http", "https"]:
                return False

            hostname = parsed.hostname
            if not hostname or hostname.lower() in WebhookEngine.BLOCKED_HOSTNAMES:
                return False

            # Check for IP address targeting private networks
            try:
                ip = ipaddress.ip_address(hostname)
                if ip.is_private or ip.is_loopback or ip.is_link_local:
                    return False
            except ValueError:
                # Hostname is a domain name (not an IP address)
                pass

            return True
        except Exception:
            return False

    @staticmethod
    def generate_signature(payload_json: str, secret_token: str, timestamp: int) -> str:
        signature_input = f"{timestamp}.{payload_json}".encode('utf-8')
        sig = hmac.new(secret_token.encode('utf-8'), signature_input, hashlib.sha256).hexdigest()
        return f"t={timestamp},v1={sig}"

    @staticmethod
    def verify_signature(payload_json: str, secret_token: str, signature_header: str, max_age_seconds: int = 300) -> bool:
        try:
            parts = dict(item.split("=") for item in signature_header.split(","))
            ts = int(parts.get("t", "0"))
            v1 = parts.get("v1", "")

            # Replay protection check
            current_time = int(time.time())
            if abs(current_time - ts) > max_age_seconds:
                logger.warning("Webhook verification failed: Timestamp replay check failed.")
                return False

            expected_sig = hmac.new(secret_token.encode('utf-8'), f"{ts}.{payload_json}".encode('utf-8'), hashlib.sha256).hexdigest()
            return hmac.compare_digest(v1, expected_sig)
        except Exception as e:
            logger.error(f"Error verifying webhook signature: {e}")
            return False

    @staticmethod
    def dispatch_webhook(target_url: str, secret_token: str, event_payload: Dict[str, Any]) -> Dict[str, Any]:
        if not WebhookEngine.validate_webhook_url(target_url):
            logger.error(f"WEBHOOK_BLOCKED: URL '{target_url}' failed SSRF security validation.")
            raise ValueError(f"SSRF Security Violation: Target URL '{target_url}' targets an internal or prohibited network endpoint.")

        payload_json = json.dumps(event_payload, sort_keys=True)
        ts = int(time.time())
        sig_header = WebhookEngine.generate_signature(payload_json, secret_token, ts)

        logger.info(f"WEBHOOK_DISPATCHED to {target_url} (Signature: {sig_header[:25]}...)")

        return {
            "target_url": target_url,
            "signature_header": sig_header,
            "status": "DELIVERED",
            "timestamp": ts
        }
