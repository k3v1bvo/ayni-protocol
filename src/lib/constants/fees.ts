/**
 * Matriz Escalonada de Comisiones y Regla de Competitividad
 * Basado en la Especificación de Requerimientos AYNI (Sección 4.2 y 4.3)
 */

export interface FeeBreakdown {
  totalFeeRate: number;        // Porcentaje total (ej: 0.10 para 10%)
  travelerFeeRate: number;     // Porcentaje para el viajero (ej: 0.05 para 5%)
  systemFeeRate: number;       // Porcentaje para mantenimiento del sistema (ej: 0.03)
  reserveFeeRate: number;      // Porcentaje para fondo contra siniestros (ej: 0.02)
  rawTravelerFee: number;      // Honorario antes del tope
  travelerFeeUsdc: number;     // Honorario final con tope de $50 USD aplicado
  systemFeeUsdc: number;       // Comisión de mantenimiento
  reserveFeeUsdc: number;      // Aporte al fondo de reserva
  totalFeeUsdc: number;        // Suma total de comisiones
  totalOrderCostUsdc: number;  // Costo producto + total comisiones
  appliedHighValueCap: boolean;// Indica si se superó y aplicó el tope de $50 USD
}

export const HIGH_VALUE_MAX_FEE_CAP_USDC = 50.0;

/**
 * Calcula el desglose financiero exacto de una orden en USDC
 * según el monto de compra en mostrador o costo del producto.
 */
export function calculateOrderFees(productCostUsdc: number): FeeBreakdown {
  const cost = Math.max(0, Number(productCostUsdc) || 0);

  let totalRate = 0.10;
  let travelerRate = 0.05;
  let systemRate = 0.03;
  let reserveRate = 0.02;

  if (cost >= 1500) {
    totalRate = 0.04;
    travelerRate = 0.03;
    systemRate = 0.01;
    reserveRate = 0.00;
  } else if (cost >= 500) {
    totalRate = 0.05;
    travelerRate = 0.03;
    systemRate = 0.02;
    reserveRate = 0.00;
  } else if (cost >= 100) {
    totalRate = 0.07;
    travelerRate = 0.04;
    systemRate = 0.03;
    reserveRate = 0.00;
  } else {
    // Menor a 100 USDC: 10% total (5% viajero, 3% sistema, 2% fondo comunitario)
    totalRate = 0.10;
    travelerRate = 0.05;
    systemRate = 0.03;
    reserveRate = 0.02;
  }

  const rawTravelerFee = cost * travelerRate;
  const appliedHighValueCap = rawTravelerFee > HIGH_VALUE_MAX_FEE_CAP_USDC;
  const travelerFeeUsdc = appliedHighValueCap ? HIGH_VALUE_MAX_FEE_CAP_USDC : rawTravelerFee;

  const systemFeeUsdc = cost * systemRate;
  const reserveFeeUsdc = cost * reserveRate;
  const totalFeeUsdc = travelerFeeUsdc + systemFeeUsdc + reserveFeeUsdc;
  const totalOrderCostUsdc = cost + totalFeeUsdc;

  return {
    totalFeeRate: totalRate,
    travelerFeeRate: travelerRate,
    systemFeeRate: systemRate,
    reserveFeeRate: reserveRate,
    rawTravelerFee: Number(rawTravelerFee.toFixed(2)),
    travelerFeeUsdc: Number(travelerFeeUsdc.toFixed(2)),
    systemFeeUsdc: Number(systemFeeUsdc.toFixed(2)),
    reserveFeeUsdc: Number(reserveFeeUsdc.toFixed(2)),
    totalFeeUsdc: Number(totalFeeUsdc.toFixed(2)),
    totalOrderCostUsdc: Number(totalOrderCostUsdc.toFixed(2)),
    appliedHighValueCap,
  };
}
