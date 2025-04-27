/**
 * Formata uma lista de dias da semana para exibição abreviada
 * - Se houver 3 dias consecutivos: Segunda, Terça e Quarta
 * - Se houver mais de 3 dias consecutivos: Segunda à Sábado
 * - Se for espaçado: Segunda à Quarta, Sexta e Sábado
 */
export function formatAvailableDays(days: string[]): string {
  if (!days || days.length === 0) return "Nenhum dia disponível";
  if (days.length === 1) return days[0];
  
  // Ordem padrão dos dias da semana
  const weekDaysOrder = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo"
  ];
  
  // Ordenar os dias conforme a ordem da semana
  const sortedDays = [...days].sort((a, b) => 
    weekDaysOrder.indexOf(a) - weekDaysOrder.indexOf(b)
  );
  
  // Identificar sequências de dias consecutivos
  const sequences: string[][] = [];
  let currentSequence: string[] = [sortedDays[0]];
  
  for (let i = 1; i < sortedDays.length; i++) {
    const currentDayIndex = weekDaysOrder.indexOf(sortedDays[i]);
    const prevDayIndex = weekDaysOrder.indexOf(sortedDays[i - 1]);
    
    if (currentDayIndex - prevDayIndex === 1) {
      // Dia consecutivo, adicionar à sequência atual
      currentSequence.push(sortedDays[i]);
    } else {
      // Não é consecutivo, iniciar nova sequência
      sequences.push(currentSequence);
      currentSequence = [sortedDays[i]];
    }
  }
  
  // Adicionar a última sequência
  sequences.push(currentSequence);
  
  // Formatar cada sequência
  const formattedSequences = sequences.map(seq => {
    if (seq.length === 1) {
      return seq[0];
    } else if (seq.length === 2) {
      return `${seq[0]} e ${seq[1]}`;
    } else {
      // Sequência de 3 ou mais dias
      return `${seq[0]} à ${seq[seq.length - 1]}`;
    }
  });
  
  // Juntar todas as sequências formatadas
  if (formattedSequences.length === 1) {
    return formattedSequences[0];
  } else if (formattedSequences.length === 2) {
    return `${formattedSequences[0]} e ${formattedSequences[1]}`;
  } else {
    const lastSequence = formattedSequences.pop();
    return `${formattedSequences.join(', ')} e ${lastSequence}`;
  }
}