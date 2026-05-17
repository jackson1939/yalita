import { env } from "../lib/env";
import { logger } from "../lib/logger";
import type { Address, DataSource } from "@yalita/shared";

/**
 * Servicio que envuelve la integración con Reclaim Protocol.
 * En producción usa el SDK real. Para el demo/hackathon, contiene
 * fallbacks que funcionan sin las keys configuradas.
 */
export class OracleService {
  private readonly enabled: boolean;

  constructor() {
    this.enabled = Boolean(env.RECLAIM_APP_ID && env.RECLAIM_APP_SECRET);
    if (!this.enabled) {
      logger.warn("Reclaim Protocol disabled — usando modo demo");
    }
  }

  /**
   * Genera la URL/deeplink que el usuario abre en su celular para iniciar
   * la generación de la prueba zkTLS.
   */
  async createRequest(input: { user: Address; providerId: string }) {
    if (!this.enabled) {
      // Modo demo: devolvemos una URL placeholder que el frontend usa
      // para simular el flujo.
      return { requestUrl: `/onboarding/verificar?demo=1&provider=${input.providerId}` };
    }

    // TODO: integración real con @reclaimprotocol/js-sdk
    return { requestUrl: `https://reclaim.app/request/${input.providerId}?user=${input.user}` };
  }

  /**
   * Procesa el callback de Reclaim, extrae las métricas del proof
   * y devuelve los valores que se subirán on-chain.
   */
  async processCallback(payload: unknown): Promise<{
    user: Address;
    dataSource: DataSource;
    txCount: number;
    totalVolumeBs: number;
    monthsCovered: number;
  }> {
    if (!this.enabled) {
      // Modo demo: payload simulado
      return {
        user: "0x0000000000000000000000000000000000000000",
        dataSource: "TIGO_MONEY",
        txCount: 0,
        totalVolumeBs: 0,
        monthsCovered: 0,
      };
    }
    // TODO: parsear el proof verificado y extraer los parámetros
    throw new Error("Not implemented");
  }
}
