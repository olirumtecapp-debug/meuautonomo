// Gerador Oficial de Payload PIX Padrão BACEN / EMV BRCode (compatível com todos os bancos brasileiros)

export function formatEMV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export function crc16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}

export function generatePixBRCode(
  key: string,
  name: string,
  city: string,
  amount: number,
  txid = "***"
): string {
  let cleanKey = key.trim();
  const digitsOnly = cleanKey.replace(/\D/g, "");

  // Padrão BACEN: Telefone celular no EMV precisa iniciar com +55 (código internacional do Brasil)
  if (!cleanKey.includes("@") && (digitsOnly.length === 10 || digitsOnly.length === 11)) {
    cleanKey = `+55${digitsOnly}`;
  } else if (!cleanKey.includes("@") && (digitsOnly.length === 14 || digitsOnly.length === 11)) {
    cleanKey = digitsOnly;
  }

  const cleanName = (name || "MEUAUTONOMO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, 25)
    .toUpperCase() || "MEUAUTONOMO";

  const cleanCity = (city || "SAO PAULO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, 15)
    .toUpperCase() || "SAO PAULO";

  const formattedAmount = amount > 0 ? amount.toFixed(2) : "";

  // 26: Merchant Account Information
  const merchantInfo = formatEMV("00", "br.gov.bcb.pix") + formatEMV("01", cleanKey);
  const cleanTxId = (txid || "***").replace(/[^a-zA-Z0-9*]/g, "").slice(0, 25) || "***";
  const additionalData = formatEMV("05", cleanTxId);

  let payload =
    formatEMV("00", "01") +
    formatEMV("26", merchantInfo) +
    formatEMV("52", "0000") +
    formatEMV("53", "986") +
    (formattedAmount ? formatEMV("54", formattedAmount) : "") +
    formatEMV("58", "BR") +
    formatEMV("59", cleanName) +
    formatEMV("60", cleanCity) +
    formatEMV("62", additionalData) +
    "6304";

  payload += crc16(payload);
  return payload;
}
