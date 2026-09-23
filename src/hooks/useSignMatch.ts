import { useMutation } from "@tanstack/react-query";
import { getSignMatch } from "@/services/signMatch";

/** Gera a combinação de dois signos (sob demanda, ao clicar). */
export function useSignMatch() {
  return useMutation({
    mutationFn: ({
      sign1,
      sign2,
      lang,
    }: {
      sign1: string;
      sign2: string;
      lang: string;
    }) => getSignMatch(sign1, sign2, lang),
  });
}
