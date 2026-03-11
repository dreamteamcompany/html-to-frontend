import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '@/config/api';

const BASE = API_ENDPOINTS.main;

function b64urlDecode(str: string): ArrayBuffer {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(b64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}

function b64urlEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  bytes.forEach(b => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function useWebAuthn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = (): boolean => {
    return !!(
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    );
  };

  const isPlatformAuthAvailable = useCallback(async (): Promise<boolean> => {
    if (!isSupported()) return false;
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (token: string, deviceName?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const challengeRes = await fetch(`${BASE}?endpoint=webauthn-register-challenge`, {
        headers: { 'X-Auth-Token': token },
      });
      if (!challengeRes.ok) throw new Error('Ошибка получения challenge');
      const opts = await challengeRes.json();

      const credential = await navigator.credentials.create({
        publicKey: {
          ...opts,
          challenge: b64urlDecode(opts.challenge),
          user: {
            ...opts.user,
            id: b64urlDecode(opts.user.id),
          },
          excludeCredentials: (opts.excludeCredentials || []).map((c: { id: string; type: string }) => ({
            ...c,
            id: b64urlDecode(c.id),
          })),
        },
      }) as PublicKeyCredential;

      if (!credential) throw new Error('Биометрия не подтверждена');

      const response = credential.response as AuthenticatorAttestationResponse;
      const body = {
        id: credential.id,
        rawId: b64urlEncode(credential.rawId),
        type: credential.type,
        device_name: deviceName || getDeviceName(),
        response: {
          attestationObject: b64urlEncode(response.attestationObject),
          clientDataJSON: b64urlEncode(response.clientDataJSON),
        },
      };

      const regRes = await fetch(`${BASE}?endpoint=webauthn-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify(body),
      });
      if (!regRes.ok) {
        const err = await regRes.json();
        throw new Error(err.error || 'Ошибка регистрации');
      }

      localStorage.setItem('webauthn_enabled', '1');
      return true;
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'NotAllowedError') {
        setError('Доступ к биометрии запрещён или отменён');
      } else {
        setError(e instanceof Error ? e.message : 'Ошибка регистрации биометрии');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (): Promise<{ token: string; user: unknown } | null> => {
    setLoading(true);
    setError(null);
    try {
      const challengeRes = await fetch(`${BASE}?endpoint=webauthn-auth-challenge`);
      if (!challengeRes.ok) throw new Error('Ошибка получения challenge');
      const opts = await challengeRes.json();

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: b64urlDecode(opts.challenge),
          rpId: opts.rpId,
          timeout: opts.timeout || 60000,
          userVerification: 'required',
          allowCredentials: (opts.allowCredentials || []).map((c: { id: string; type: string }) => ({
            ...c,
            id: b64urlDecode(c.id),
          })),
        },
      }) as PublicKeyCredential;

      if (!credential) throw new Error('Биометрия не подтверждена');

      const authResp = credential.response as AuthenticatorAssertionResponse;
      const body = {
        id: credential.id,
        rawId: b64urlEncode(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: b64urlEncode(authResp.authenticatorData),
          clientDataJSON: b64urlEncode(authResp.clientDataJSON),
          signature: b64urlEncode(authResp.signature),
          userHandle: authResp.userHandle ? b64urlEncode(authResp.userHandle) : null,
        },
      };

      const authRes = await fetch(`${BASE}?endpoint=webauthn-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!authRes.ok) {
        const err = await authRes.json();
        throw new Error(err.error || 'Ошибка аутентификации');
      }

      return await authRes.json();
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'NotAllowedError') {
        setError('Биометрия отменена пользователем');
      } else {
        setError(e instanceof Error ? e.message : 'Ошибка биометрической аутентификации');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCredentials = useCallback(async (token: string) => {
    const res = await fetch(`${BASE}?endpoint=webauthn-credentials`, {
      headers: { 'X-Auth-Token': token },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.credentials || [];
  }, []);

  const deleteCredential = useCallback(async (token: string, id: number): Promise<boolean> => {
    const res = await fetch(`${BASE}?endpoint=webauthn-credentials&id=${id}`, {
      method: 'DELETE',
      headers: { 'X-Auth-Token': token },
    });
    if (res.ok) {
      const remaining = await getCredentials(token);
      if (remaining.length === 0) localStorage.removeItem('webauthn_enabled');
      return true;
    }
    return false;
  }, [getCredentials]);

  return {
    isSupported,
    isPlatformAuthAvailable,
    register,
    authenticate,
    getCredentials,
    deleteCredential,
    loading,
    error,
    setError,
  };
}

function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows';
  return 'Устройство';
}
