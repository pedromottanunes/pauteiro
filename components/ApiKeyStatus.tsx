import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { AiModel } from '../types';
import { hasApiKey } from '../utils/apiKeys';

interface Props {
  model: AiModel;
  className?: string;
}

export const ApiKeyStatus: React.FC<Props> = ({ model, className = '' }) => {
  const hasKey = hasApiKey(model);
  
  const getModelName = (model: AiModel): string => {
    switch (model) {
      case AiModel.OPENAI:
        return 'OpenAI';
      case AiModel.GEMINI:
        return 'Gemini';
      case AiModel.SONET:
        return 'Claude';
      case AiModel.DEEPSEEK:
        return 'DeepSeek';
      case AiModel.MANUS:
        return 'Manus';
      default:
        return model;
    }
  };
  
  if (hasKey) {
    return (
      <div className={`flex items-center gap-2 text-emerald-600 text-sm ${className}`}>
        <CheckCircle2 size={16} />
        <span>API Key {getModelName(model)} configurada</span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 text-amber-600 text-sm ${className}`}>
      <AlertCircle size={16} />
      <span>Configure a API Key {getModelName(model)} nas Configurações</span>
    </div>
  );
};
