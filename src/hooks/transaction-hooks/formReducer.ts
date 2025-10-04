"use client";

import { CategoryEnum, PaymentSource, TransactionType } from "@prisma/client";
import { useEffect, useReducer } from "react";
import { TransactionData } from "../../types/transaction-modal-types";

interface FormState {
  amount: number;
  description: string;
  date: Date;
  transactionType: TransactionType;
  transactionPaymentSource: PaymentSource;
  transactionCategory: CategoryEnum;
  isRecurring: boolean;
  recurringId: string;
}

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: unknown }
  | { type: "RESET_FORM" }
  | { type: "LOAD_DATA"; data: Partial<FormState> };

const initialFormState: FormState = {
  amount: 0,
  description: "",
  date: new Date(),
  transactionType: TransactionType.INCOME,
  transactionPaymentSource: PaymentSource.DEBIT_CARD,
  transactionCategory: CategoryEnum.OTHER,
  isRecurring: false,
  recurringId: "",
};

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "RESET_FORM":
      return initialFormState;
    case "LOAD_DATA":
      return {
        ...initialFormState,
        ...action.data,
      };
    default:
      return state;
  }
}

export const useTransactionForm = (
  transactionData?: TransactionData,
  type?: "create" | "update"
) => {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  // Atualizar campos individualmente
  const setField = (field: keyof FormState, value: unknown) => {
    dispatch({ type: "SET_FIELD", field, value });
  };

  const resetForm = () => {
    dispatch({ type: "RESET_FORM" });
  };

  useEffect(() => {
    if (transactionData && type === "update") {
      const formData = {
        amount: transactionData.amount || 0,
        description: transactionData.description || "",
        date: transactionData.date
          ? new Date(transactionData.date)
          : new Date(),
        transactionType: transactionData.type || TransactionType.INCOME,
        transactionCategory: transactionData.category || CategoryEnum.OTHER,
        transactionPaymentSource:
          transactionData.paymentSource || PaymentSource.DEBIT_CARD,
        isRecurring: transactionData.isRecurring || false,
        recurringId: transactionData.recurringId || "",
      };
      dispatch({ type: "LOAD_DATA", data: formData });
    }
  }, [transactionData, type]);

  return {
    formState,
    setField,
    resetForm,
  };
};
