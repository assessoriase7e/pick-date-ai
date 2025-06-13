// Lista de padrões de números de telefone inválidos comuns
// Formato: números sem formatação (apenas dígitos)

export const invalidPhonePatterns = [
  // Números com dígitos repetidos
  "00000000000", // (00) 00000-0000
  "11111111111", // (11) 11111-1111
  "22222222222", // (22) 22222-2222
  "33333333333", // (33) 33333-3333
  "44444444444", // (44) 44444-4444
  "55555555555", // (55) 55555-5555
  "66666666666", // (66) 66666-6666
  "77777777777", // (77) 77777-7777
  "88888888888", // (88) 88888-8888
  "99999999999", // (99) 99999-9999
  
  // Números com padrões sequenciais
  "12345678900", // (12) 34567-8900
  "01234567890", // (01) 23456-7890
  "98765432100", // (98) 76543-2100
  "09876543210", // (09) 87654-3210
  "12345123451", // (12) 34512-3451
  "12121212121", // (12) 12121-2121
  "10101010101", // (10) 10101-0101
  "12312312312", // (12) 31231-2312
  
  // DDDs inválidos ou suspeitos
  "00123456789", // (00) 12345-6789
  "01123456789", // (01) 12345-6789
  "02123456789", // (02) 12345-6789
  "03123456789", // (03) 12345-6789
  "04123456789", // (04) 12345-6789
  "05123456789", // (05) 12345-6789
  "06123456789", // (06) 12345-6789
  "09123456789", // (09) 12345-6789
  
  // Números de teste comuns
  "12345678901", // (12) 34567-8901
  "11987654321", // (11) 98765-4321
  "11111222222", // (11) 11122-2222
  "22222111111", // (22) 22211-1111
  
  // Padrões alternados
  "10101010101", // (10) 10101-0101
  "01010101010", // (01) 01010-1010
  "12121212121", // (12) 12121-2121
  "90909090909", // (90) 90909-0909
  
  // Padrões com blocos repetidos
  "11112222333", // (11) 11222-2333
  "99998888777", // (99) 99888-8777
  "12341234123", // (12) 34123-4123
  "98769876987", // (98) 76987-6987
  
  // Números com prefixos de serviços especiais
  "08001234567", // (08) 00123-4567 (formato de 0800)
  "09001234567", // (09) 00123-4567 (formato de 0900)
  "19001234567", // (19) 00123-4567
  
  // Outros padrões suspeitos
  "12300000000", // (12) 30000-0000
  "11999999999", // (11) 99999-9999
  "00999999999", // (00) 99999-9999
  "00900000000", // (00) 90000-0000
];

// Função auxiliar para verificar se um número de telefone tem todos os dígitos iguais
export function hasAllSameDigits(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^(\d)\1+$/.test(cleaned);
}

// Função auxiliar para verificar se um número de telefone tem padrão sequencial
export function hasSequentialPattern(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^(?:0123456789|9876543210)\d*$/.test(cleaned) || 
         /^(?:1234567890|0987654321)\d*$/.test(cleaned);
}

// Função auxiliar para verificar se um DDD é válido
export function hasValidDDD(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  // DDDs inválidos começam com 00, 01, 02, 03, 04, 05, 06, 09
  return !(/^(00|01|02|03|04|05|06|09)/.test(cleaned));
}