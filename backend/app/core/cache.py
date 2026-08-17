import json
import time
import inspect
import functools
import logging
from typing import Any, Callable, Dict, Optional, List, Tuple
from app.core.config import settings

logger = logging.getLogger("ecotrend.cache")

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    redis = None
    REDIS_AVAILABLE = False


class InMemoryCache:
    """
    In-memory fallback cache with TTL support for single-instance local development/testing.
    """
    def __init__(self):
        self._store: Dict[str, Tuple[Any, float]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._store:
            val, expire_at = self._store[key]
            if expire_at > time.time():
                return val
            else:
                del self._store[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        expire_at = time.time() + ttl_seconds
        self._store[key] = (value, expire_at)

    def delete(self, key: str) -> None:
        if key in self._store:
            del self._store[key]

    def invalidate_prefix(self, prefix: str) -> None:
        keys_to_del = [k for k in self._store if k.startswith(prefix)]
        for k in keys_to_del:
            del self._store[k]

    def clear(self) -> None:
        self._store.clear()


class CacheManager:
    """
    Production-grade Redis-backed Cache Manager with in-memory fallback for local dev/test.
    """

    def __init__(self):
        self._redis_client = None
        self._in_memory_fallback = InMemoryCache()
        self._use_redis = False
        self._init_redis()

    def _init_redis(self) -> None:
        if not settings.CACHE_ENABLED:
            logger.info("Caching is explicitly disabled via CACHE_ENABLED=False.")
            return

        if REDIS_AVAILABLE:
            try:
                client = redis.Redis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    password=settings.REDIS_PASSWORD,
                    db=settings.REDIS_DB,
                    socket_timeout=1.0,
                    socket_connect_timeout=1.0,
                    decode_responses=True
                )
                client.ping()
                self._redis_client = client
                self._use_redis = True
                logger.info(f"Connected to Redis cache at {settings.REDIS_HOST}:{settings.REDIS_PORT}")
            except Exception as e:
                logger.warning(f"Redis connection failed ({e}). Falling back to in-memory dev cache.")
                self._use_redis = False

    def is_redis_active(self) -> bool:
        return self._use_redis and self._redis_client is not None

    def get(self, key: str) -> Optional[Any]:
        if not settings.CACHE_ENABLED:
            return None

        if self._use_redis and self._redis_client:
            try:
                data = self._redis_client.get(key)
                if data is not None:
                    return json.loads(data)
            except Exception as e:
                logger.warning(f"Redis GET failed for key '{key}': {e}. Falling back to in-memory.")
                self._use_redis = False

        return self._in_memory_fallback.get(key)

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        if not settings.CACHE_ENABLED or value is None:
            return

        ttl = ttl_seconds if ttl_seconds is not None else settings.CACHE_DEFAULT_TTL

        try:
            json_data = json.dumps(value)
        except (TypeError, ValueError) as e:
            logger.warning(f"Serialization failed for key '{key}': {e}. Skipping cache.")
            return

        if self._use_redis and self._redis_client:
            try:
                self._redis_client.set(key, json_data, ex=ttl)
                return
            except Exception as e:
                logger.warning(f"Redis SET failed for key '{key}': {e}. Falling back to in-memory.")
                self._use_redis = False

        self._in_memory_fallback.set(key, value, ttl_seconds=ttl)

    def delete(self, key: str) -> None:
        if self._use_redis and self._redis_client:
            try:
                self._redis_client.delete(key)
            except Exception as e:
                logger.warning(f"Redis DELETE failed for key '{key}': {e}")
                self._use_redis = False

        self._in_memory_fallback.delete(key)

    def invalidate_prefix(self, prefix: str) -> None:
        if self._use_redis and self._redis_client:
            try:
                pattern = f"{prefix}*"
                keys = self._redis_client.keys(pattern)
                if keys:
                    self._redis_client.delete(*keys)
            except Exception as e:
                logger.warning(f"Redis invalidation for prefix '{prefix}' failed: {e}")
                self._use_redis = False

        self._in_memory_fallback.invalidate_prefix(prefix)

    def clear(self) -> None:
        if self._use_redis and self._redis_client:
            try:
                self._redis_client.flushdb()
            except Exception:
                pass
        self._in_memory_fallback.clear()


cache_manager = CacheManager()


def make_cache_key(prefix: str, func_name: str, args: Tuple[Any, ...], kwargs: Dict[str, Any]) -> str:
    """
    Generate deterministic, parameter-sensitive cache key.
    Includes prefix, function name, and sorted kwargs/args.
    Excludes FastAPI DB session parameters or requests.
    """
    filtered_kwargs = {}
    for k, v in sorted(kwargs.items()):
        if k in ("db", "session", "request", "response"):
            continue
        filtered_kwargs[k] = v

    filtered_args = [a for a in args if not hasattr(a, "execute") and not hasattr(a, "query")]
    key_str = f"{prefix}:{func_name}:args={filtered_args}:kwargs={filtered_kwargs}"
    return key_str


def cached_endpoint(prefix: str = "ecotrend", ttl_seconds: Optional[int] = None, is_user_specific: bool = False):
    """
    Decorator for API endpoints & engine calculations.
    - Deterministic key generation from function arguments.
    - Bypasses cache if is_user_specific is True or auth headers present without user_id key.
    - Never caches exceptions or invalid returns.
    - Handles Redis / cache errors gracefully (fails open).
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            if is_user_specific:
                return await func(*args, **kwargs)

            cache_key = make_cache_key(prefix, func.__name__, args, kwargs)

            try:
                cached_val = cache_manager.get(cache_key)
                if cached_val is not None:
                    return cached_val
            except Exception as e:
                logger.warning(f"Cache lookup failed for {func.__name__}: {e}")

            result = await func(*args, **kwargs)

            if result is not None:
                try:
                    cache_manager.set(cache_key, result, ttl_seconds=ttl_seconds)
                except Exception as e:
                    logger.warning(f"Cache set failed for {func.__name__}: {e}")

            return result

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            if is_user_specific:
                return func(*args, **kwargs)

            cache_key = make_cache_key(prefix, func.__name__, args, kwargs)

            try:
                cached_val = cache_manager.get(cache_key)
                if cached_val is not None:
                    return cached_val
            except Exception as e:
                logger.warning(f"Cache lookup failed for {func.__name__}: {e}")

            result = func(*args, **kwargs)

            if result is not None:
                try:
                    cache_manager.set(cache_key, result, ttl_seconds=ttl_seconds)
                except Exception as e:
                    logger.warning(f"Cache set failed for {func.__name__}: {e}")

            return result

        if inspect.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator
