# Sistema de Persistência de Dados - NeuroContent

## 📦 Como Funciona

O NeuroContent agora possui um **sistema robusto de persistência de dados** que garante que todos os seus clientes e configurações sejam salvos automaticamente.

## 🔄 Salvamento Automático

### LocalStorage (Automático)
- ✅ Todos os clientes são **salvos automaticamente** no navegador
- ✅ Ao criar, editar ou deletar um cliente, as mudanças são instantaneamente persistidas
- ✅ Quando você fecha e reabre o app, seus dados estarão lá
- ✅ Cada cliente mantém suas próprias configurações independentes

### O que é salvo automaticamente:
- ✅ **Dados do cliente**: Nome, nicho, avatar, modelo de IA
- ✅ **Configurações**: Persona, tom, objetivos, fontes
- ✅ **Concorrentes**: Lista de concorrentes cadastrados
- ✅ **Hashtags**: Base e referência
- ✅ **Regras**: Dias ativos, tipos de post, palavras proibidas/obrigatórias
- ✅ **Posts**: Todos os posts gerados para cada cliente
- ✅ **Cliente ativo**: O sistema lembra qual cliente você estava trabalhando

## 💾 Backup Manual

### Exportar Backup
1. Vá em **Clientes** no menu lateral
2. Clique no botão **Dados** no canto superior direito
3. Clique em **Exportar Backup (JSON)**
4. Um arquivo JSON será baixado com TODOS os seus dados

### Importar Backup
1. Vá em **Clientes** no menu lateral
2. Clique no botão **Dados**
3. Clique em **Importar Backup**
4. Selecione o arquivo JSON que você exportou anteriormente
5. Todos os dados serão restaurados

## 🗑️ Limpar Dados

Se você quiser começar do zero:
1. Vá em **Clientes** → **Dados**
2. Clique em **Apagar Todos os Dados**
3. Confirme a ação (⚠️ isso NÃO pode ser desfeito!)

## 📁 Estrutura de Arquivos

### Arquivos Criados

```
GenContent/
├── utils/
│   └── storage.ts          # Funções de storage e backup
├── hooks/
│   └── usePersistedClients.ts  # Hook customizado para persistência
└── components/
    └── DataManagement.tsx  # Interface de gerenciamento de dados
```

## 🛠️ Arquitetura Técnica

### storage.ts
Funções principais:
- `saveClients()` - Salva clientes no localStorage
- `loadClients()` - Carrega clientes do localStorage
- `exportToJSON()` - Exporta para arquivo JSON
- `importFromJSON()` - Importa de arquivo JSON
- `downloadBackup()` - Download do backup
- `clearStorage()` - Limpa todos os dados

### usePersistedClients.ts
Hook customizado que fornece:
- `clients` - Array de clientes
- `activeClient` - Cliente atualmente ativo
- `addClient()` - Adiciona novo cliente
- `updateClient()` - Atualiza cliente existente
- `removeClient()` - Remove cliente
- `updateClientSettings()` - Atualiza configurações
- `updateClientPosts()` - Atualiza posts

### DataManagement.tsx
Componente UI para:
- Visualizar estatísticas de storage
- Exportar backup
- Importar backup
- Limpar todos os dados

## 🔐 Segurança

- ✅ Dados armazenados localmente no navegador
- ✅ Nenhuma informação é enviada para servidores externos
- ✅ Você tem controle total dos seus dados
- ✅ Backups JSON podem ser guardados onde você quiser

## 🎯 Fluxo de Uso

### Criando um Cliente
```
1. Clique em "Novo cliente"
2. Preencha os dados (nome, nicho, etc)
3. Configure tudo no wizard
4. Clique em "Salvar cliente"
→ ✅ Salvo automaticamente!
```

### Editando Configurações
```
1. Clique no card do cliente
2. Clique em "Config"
3. Altere o que precisar
4. As mudanças são salvas em tempo real
→ ✅ Sem necessidade de clicar em "salvar"!
```

### Fazendo Backup
```
1. Botão "Dados" na tela de Clientes
2. "Exportar Backup"
→ ✅ Arquivo JSON baixado
```

## 📊 Formato do Backup JSON

```json
{
  "version": "1.0.0",
  "timestamp": "2025-11-26T10:30:00.000Z",
  "clients": [
    {
      "id": "abc-123",
      "name": "Clínica Dental",
      "nicho": "Odontologia Estética",
      "settings": { ... },
      "posts": [ ... ]
    }
  ],
  "activeClientId": "abc-123"
}
```

## ⚠️ Limitações

### LocalStorage
- Limite típico: ~5-10MB por domínio
- Dados ficam no navegador específico
- Se limpar cache do navegador, dados são perdidos

### Solução
**Faça backups regulares!** Use o botão "Exportar Backup" e guarde o JSON em um local seguro.

## 🚀 Versionamento

O sistema possui migração automática de dados entre versões:
- Quando uma nova versão do app é detectada
- Os dados antigos são migrados automaticamente
- Sem perda de informação

## 💡 Dicas

1. **Backup Regular**: Exporte seus dados semanalmente
2. **Múltiplos Navegadores**: Use "Importar Backup" para sincronizar
3. **Antes de Limpar Cache**: Exporte um backup primeiro
4. **Teste com Backup**: Importe backups antigos para restaurar dados

## 🐛 Troubleshooting

### "Meus dados sumiram!"
- Verifique se está no mesmo navegador
- Tente importar o último backup
- Verifique se o cache não foi limpo

### "Não consigo exportar"
- Verifique se tem clientes cadastrados
- Tente em outro navegador
- Veja o console para erros

### "Importação falhou"
- Verifique se o arquivo JSON está correto
- Não edite o JSON manualmente
- Use apenas backups gerados pelo próprio sistema

## 📞 Logs

O sistema gera logs no console para debug:
- `[Storage]` - Operações de storage
- `[Hook]` - Operações do hook de clientes

Abra o DevTools (F12) para ver os logs em tempo real.
