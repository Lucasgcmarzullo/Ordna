'use client';

import { useState } from 'react';
import { Download, Upload, Save, Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { getTasks, getEvents, getTransactions, saveTasks, saveEvents, saveTransactions } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';

interface BackupData {
  version: string;
  timestamp: string;
  user: {
    email: string;
    name: string;
  };
  data: {
    tasks: any[];
    events: any[];
    transactions: any[];
  };
}

export default function BackupModule() {
  const { currentUser } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportBackup = () => {
    setIsExporting(true);
    setMessage(null);

    try {
      const tasks = getTasks();
      const events = getEvents();
      const transactions = getTransactions();

      const backup: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        user: {
          email: currentUser?.email || '',
          name: currentUser?.nome || '',
        },
        data: {
          tasks,
          events,
          transactions,
        },
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordna-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({
        type: 'success',
        text: `✅ Backup exportado com sucesso! ${tasks.length} tarefas, ${events.length} eventos e ${transactions.length} transações salvas.`,
      });
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      setMessage({
        type: 'error',
        text: '❌ Erro ao exportar backup. Tente novamente.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup: BackupData = JSON.parse(content);

        // Validar estrutura do backup
        if (!backup.version || !backup.data) {
          throw new Error('Arquivo de backup inválido');
        }

        // Confirmar antes de sobrescrever
        const confirm = window.confirm(
          `⚠️ ATENÇÃO: Isso irá substituir todos os seus dados atuais!\n\n` +
          `Backup de: ${backup.user.name} (${backup.user.email})\n` +
          `Data: ${new Date(backup.timestamp).toLocaleString('pt-BR')}\n\n` +
          `Tarefas: ${backup.data.tasks.length}\n` +
          `Eventos: ${backup.data.events.length}\n` +
          `Transações: ${backup.data.transactions.length}\n\n` +
          `Deseja continuar?`
        );

        if (!confirm) {
          setIsImporting(false);
          return;
        }

        // Restaurar dados
        saveTasks(backup.data.tasks);
        saveEvents(backup.data.events);
        saveTransactions(backup.data.transactions);

        setMessage({
          type: 'success',
          text: `✅ Backup restaurado com sucesso! ${backup.data.tasks.length} tarefas, ${backup.data.events.length} eventos e ${backup.data.transactions.length} transações carregadas.`,
        });

        // Recarregar página após 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Erro ao importar backup:', error);
        setMessage({
          type: 'error',
          text: '❌ Erro ao importar backup. Verifique se o arquivo é válido.',
        });
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
  };

  const stats = {
    tasks: getTasks().length,
    events: getEvents().length,
    transactions: getTransactions().length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Backup e Restauração 💾
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Salve e restaure todos os seus dados com segurança
        </p>
      </div>

      {/* Estatísticas Atuais */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-8 h-8 text-blue-500" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Dados Atuais
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tarefas</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.tasks}</p>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Eventos</p>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{stats.events}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transações</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.transactions}</p>
          </div>
        </div>
      </div>

      {/* Mensagem de Feedback */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
            <p
              className={`font-semibold ${
                message.type === 'success'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}
            >
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Exportar Backup */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-8 h-8 text-blue-500" />
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Exportar Backup
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Salve todos os seus dados em um arquivo JSON
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
          <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">
            O que será salvo:
          </h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>✅ Todas as suas tarefas (completas e pendentes)</li>
            <li>✅ Todos os eventos do calendário</li>
            <li>✅ Todas as transações financeiras</li>
            <li>✅ Informações do usuário</li>
          </ul>
        </div>

        <button
          onClick={handleExportBackup}
          disabled={isExporting}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Baixar Backup Completo
            </>
          )}
        </button>
      </div>

      {/* Importar Backup */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="w-8 h-8 text-orange-500" />
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Restaurar Backup
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Carregue um arquivo de backup anterior
            </p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-4 border border-orange-300 dark:border-orange-700">
          <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2">
            ⚠️ ATENÇÃO:
          </h4>
          <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
            <li>• Isso irá <strong>substituir</strong> todos os seus dados atuais</li>
            <li>• Faça um backup dos dados atuais antes de restaurar</li>
            <li>• A página será recarregada após a restauração</li>
          </ul>
        </div>

        <label className="block">
          <input
            type="file"
            accept=".json"
            onChange={handleImportBackup}
            disabled={isImporting}
            className="hidden"
            id="backup-file-input"
          />
          <div
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => document.getElementById('backup-file-input')?.click()}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Selecionar Arquivo de Backup
              </>
            )}
          </div>
        </label>
      </div>

      {/* Informações Adicionais */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
          💡 Dicas Importantes
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            <strong>Faça backups regulares:</strong> Recomendamos exportar seus dados semanalmente
          </li>
          <li>
            <strong>Guarde em local seguro:</strong> Salve o arquivo em nuvem (Google Drive, Dropbox, etc.)
          </li>
          <li>
            <strong>Antes de atualizar:</strong> Sempre faça backup antes de grandes atualizações do app
          </li>
          <li>
            <strong>Sincronização:</strong> Com Premium, seus dados são sincronizados automaticamente entre dispositivos
          </li>
        </ul>
      </div>
    </div>
  );
}
