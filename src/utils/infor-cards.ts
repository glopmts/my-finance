export const getFrequencyLabel = (frequency: string) => {
  const labels = {
    MONTHLY: "Mensal",
    WEEKLY: "Semanal",
    YEARLY: "Anual",
    DAILY: "Diário",
  };
  return labels[frequency as keyof typeof labels] || frequency;
};
